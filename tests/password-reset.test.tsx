import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const resetPasswordForEmail = vi.fn(async () => ({ error: null as null | { message: string } }));
const getUser = vi.fn(async () => ({ data: { user: { id: 'u1' } as null | { id: string } } }));
const updateUser = vi.fn(async () => ({ error: null as null | { message: string } }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { resetPasswordForEmail } }) }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { getUser, updateUser } }) }));

const post = async (body: unknown, ip = '10.0.0.1') => {
  const { POST } = await import('@/app/api/auth/reset-password/route');
  return POST(new Request('http://127.0.0.1:3000/api/auth/reset-password', {
    method: 'POST', body: JSON.stringify(body), headers: { 'x-forwarded-for': ip },
  }));
};

beforeEach(() => {
  resetPasswordForEmail.mockClear();
  updateUser.mockClear();
});

describe('POST /api/auth/reset-password (was missing: the login form posted to a 404)', () => {
  it('sends the reset email via /auth/confirm to /reset-password', async () => {
    const res = await post({ email: 'pilgrim@example.com' }, '10.0.0.2');
    expect(res.status).toBe(200);
    expect(resetPasswordForEmail).toHaveBeenCalledWith('pilgrim@example.com', {
      redirectTo: 'http://127.0.0.1:3000/auth/confirm?next=/reset-password',
    });
  });

  it('returns the link to the host the browser used (Origin header)', async () => {
    const { POST } = await import('@/app/api/auth/reset-password/route');
    await POST(new Request('http://localhost:3100/api/auth/reset-password', {
      method: 'POST', body: JSON.stringify({ email: 'a@example.com' }),
      headers: { 'x-forwarded-for': '10.0.0.5', origin: 'http://127.0.0.1:3100' },
    }));
    expect(resetPasswordForEmail).toHaveBeenLastCalledWith('a@example.com', {
      redirectTo: 'http://127.0.0.1:3100/auth/confirm?next=/reset-password',
    });
  });

  it('answers the same way when Supabase errors, so it cannot reveal accounts', async () => {
    resetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'User not found' } });
    const res = await post({ email: 'nobody@example.com' }, '10.0.0.3');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sent: true });
  });

  it('rejects an invalid email', async () => {
    expect((await post({ email: 'nope' }, '10.0.0.4')).status).toBe(400);
  });

  it('is rate limited', async () => {
    const codes = [];
    for (let i = 0; i < 6; i += 1) codes.push((await post({ email: 'a@example.com' }, '10.0.0.9')).status);
    expect(codes.at(-1)).toBe(429);
  });
});

describe('/reset-password sets the new password for the recovered session', () => {
  it('explains an expired link when there is no session', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });
    const { ResetPasswordForm } = await import('@/components/auth/ResetPasswordForm');
    render(<ResetPasswordForm />);
    expect(await screen.findByTestId('reset-no-session')).toHaveTextContent('Request a new reset link');
  });

  it('enforces the sign-up password rule and matching passwords', async () => {
    const { ResetPasswordForm } = await import('@/components/auth/ResetPasswordForm');
    render(<ResetPasswordForm />);
    await screen.findByTestId('reset-form');
    fireEvent.change(screen.getByTestId('reset-password'), { target: { value: 'weak' } });
    fireEvent.change(screen.getByTestId('reset-confirm'), { target: { value: 'weak' } });
    fireEvent.click(screen.getByTestId('reset-submit'));
    expect(await screen.findByTestId('reset-error')).toHaveTextContent('at least 8 characters');
    fireEvent.change(screen.getByTestId('reset-password'), { target: { value: 'NewPass1!' } });
    fireEvent.change(screen.getByTestId('reset-confirm'), { target: { value: 'NewPass2!' } });
    fireEvent.click(screen.getByTestId('reset-submit'));
    expect(await screen.findByTestId('reset-error')).toHaveTextContent('do not match');
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('updates the password and confirms', async () => {
    const { ResetPasswordForm } = await import('@/components/auth/ResetPasswordForm');
    render(<ResetPasswordForm />);
    await screen.findByTestId('reset-form');
    fireEvent.change(screen.getByTestId('reset-password'), { target: { value: 'NewPass1!' } });
    fireEvent.change(screen.getByTestId('reset-confirm'), { target: { value: 'NewPass1!' } });
    fireEvent.click(screen.getByTestId('reset-submit'));
    await waitFor(() => expect(screen.getByTestId('reset-done')).toBeInTheDocument());
    expect(updateUser).toHaveBeenCalledWith({ password: 'NewPass1!' });
  });
});
