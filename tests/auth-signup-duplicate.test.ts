import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '../lib/errors';

// Mocks for the two Supabase clients apiSignUp depends on.
const signUpMock = vi.fn();
const updateUserByIdMock = vi.fn();

vi.mock('../lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { signUp: signUpMock },
  })),
}));

vi.mock('../lib/supabase/service-role', () => ({
  createServiceRoleClient: vi.fn(() => ({
    auth: { admin: { updateUserById: updateUserByIdMock } },
  })),
}));

import { apiSignUp } from '../lib/auth/api';

const validInput = {
  email: 'existing@example.com',
  password: 'Password1!',
  role: 'customer' as const,
  name: 'Existing User',
};

describe('apiSignUp — duplicate email detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: role write succeeds (only reached on the happy path).
    updateUserByIdMock.mockResolvedValue({ error: null });
    process.env.FEATURE_USE_REAL_DB = 'false';
  });

  it('throws AUTH_EMAIL_ALREADY_EXISTS when Supabase returns an error code (confirmation disabled)', async () => {
    signUpMock.mockResolvedValue({
      data: { user: null },
      error: { code: 'user_already_exists', message: 'User already registered' },
    });

    await expect(apiSignUp(validInput)).rejects.toMatchObject({
      code: 'AUTH_EMAIL_ALREADY_EXISTS',
    });
  });

  it('throws AUTH_EMAIL_ALREADY_EXISTS when Supabase returns empty identities (confirmation enabled, anti-enumeration)', async () => {
    // This is the production case: "Confirm email" is ON, so Supabase returns
    // error=null and an obfuscated user with identities: [] for a known email.
    signUpMock.mockResolvedValue({
      data: {
        user: {
          id: '00000000-0000-0000-0000-000000000000',
          email: validInput.email,
          identities: [],
          user_metadata: {},
        },
        session: null,
      },
      error: null,
    });

    await expect(apiSignUp(validInput)).rejects.toBeInstanceOf(AppError);
    await expect(apiSignUp(validInput)).rejects.toMatchObject({
      code: 'AUTH_EMAIL_ALREADY_EXISTS',
      status: 409,
    });

    // Critically: we must NOT have called updateUserById on the fake user
    // (that is what previously threw the 500 "Something went wrong").
    expect(updateUserByIdMock).not.toHaveBeenCalled();
  });

  it('proceeds to write the role for a genuine new signup (non-empty identities)', async () => {
    signUpMock.mockResolvedValue({
      data: {
        user: {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'brand-new@example.com',
          identities: [{ id: 'abc', provider: 'email' }],
          user_metadata: { name: 'Brand New' },
        },
        session: null,
      },
      error: null,
    });

    const result = await apiSignUp({ ...validInput, email: 'brand-new@example.com' });

    expect(updateUserByIdMock).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
      { app_metadata: { role: 'customer' } },
    );
    expect(result.user?.id).toBe('11111111-1111-1111-1111-111111111111');
  });
});
