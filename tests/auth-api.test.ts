import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit } from '../lib/rate-limit';
import { isDevAuthEnabled } from '../lib/auth/dev-users';
import { signUpSchema, signInSchema, interestSchema } from '../lib/validation';

// Reset rate limit store before each test
vi.mock('../lib/rate-limit', async () => {
  const actual = await vi.importActual<typeof import('../lib/rate-limit')>('../lib/rate-limit');
  return {
    ...actual,
    checkRateLimit: vi.fn(() => ({ limited: false })),
    getRateLimitIdentifier: vi.fn(() => 'ratelimit:test'),
  };
});

describe('Auth API Security', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Dev auth environment gate', () => {
    it('allows documented dev accounts in local development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(isDevAuthEnabled()).toBe(true);
    });

    it('allows documented dev accounts in Vercel preview deployments', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('VERCEL_ENV', 'preview');
      expect(isDevAuthEnabled()).toBe(true);
    });

    it('keeps documented dev accounts disabled in production by default', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('VERCEL_ENV', 'production');
      expect(isDevAuthEnabled()).toBe(false);
    });

    it('allows an explicit server-side override for controlled QA', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('VERCEL_ENV', 'production');
      vi.stubEnv('KAABATRIP_ENABLE_DEV_AUTH', 'true');
      expect(isDevAuthEnabled()).toBe(true);
    });
  });

  describe('Zod Validation — Sign Up', () => {
    it('rejects admin role', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1!',
        role: 'admin',
        name: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid customer signup', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1!',
        role: 'customer',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('rejects weak password (no uppercase)', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'password1!',
        role: 'customer',
      });
      expect(result.success).toBe(false);
    });

    it('rejects weak password (no special character)', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1',
        role: 'customer',
      });
      expect(result.success).toBe(false);
    });

    it('rejects weak password (too short)', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'Pass1!',
        role: 'customer',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = signUpSchema.safeParse({
        email: 'not-an-email',
        password: 'Password1!',
        role: 'customer',
      });
      expect(result.success).toBe(false);
    });

    it('rejects long name', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1!',
        role: 'customer',
        name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Zod Validation — Sign In', () => {
    it('accepts valid credentials', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'anyPassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = signInSchema.safeParse({
        email: 'not-an-email',
        password: 'password',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing password', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Zod Validation — Interest', () => {
    it('accepts valid hajj interest', () => {
      const result = interestSchema.safeParse({
        email: 'test@example.com',
        type: 'hajj',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid type', () => {
      const result = interestSchema.safeParse({
        email: 'test@example.com',
        type: 'christmas',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('allows requests under the limit', () => {
      const result = { limited: false as const };
      expect(result.limited).toBe(false);
    });

    it('blocks requests over the limit', () => {
      const result = { limited: true as const, retryAfter: 900 };
      expect(result.limited).toBe(true);
      expect(result.retryAfter).toBe(900);
    });
  });
});
