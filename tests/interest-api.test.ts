import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';

// Mock NextRequest/NextResponse from next/server
vi.mock('next/server', () => {
  const NextResponse = {
    json: (body: unknown, init?: { status?: number }) => ({
      _body: body,
      _status: init?.status ?? 200,
      json: async () => body,
      status: init?.status ?? 200,
    }),
  };
  return { NextResponse, NextRequest: class {} };
});

// Mock rate-limit so tests don't require Upstash or real IP headers
vi.mock('../lib/rate-limit', async () => {
  const actual = await vi.importActual<typeof import('../lib/rate-limit')>('../lib/rate-limit');
  return {
    ...actual,
    checkRateLimit: vi.fn(() => ({ limited: false })),
    getRateLimitIdentifier: vi.fn(() => 'test-identifier'),
  };
});

const makeRequest = (body: unknown) => ({
  json: async () => body,
  headers: { get: () => null },
});

async function callRoute(body: unknown) {
  const { POST } = await import('@/app/api/interest/route');
  const req = makeRequest(body);
  const res = await POST(req as never);
  return { body: (res as unknown as { _body: unknown })._body, status: (res as unknown as { _status: number })._status };
}

describe('/api/interest route', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  describe('valid submissions', () => {
    it('returns 201 for new hajj interest', async () => {
      const { body, status } = await callRoute({ email: 'test@example.com', type: 'hajj' });
      expect(status).toBe(201);
      expect((body as { message: string }).message).toContain('Interest registered');
      expect((body as { email: string }).email).toBe('test@example.com');
      expect((body as { type: string }).type).toBe('hajj');
    });

    it('returns 201 for new umrah interest', async () => {
      const { body, status } = await callRoute({ email: 'user@test.co.uk', type: 'umrah' });
      expect(status).toBe(201);
      expect((body as { type: string }).type).toBe('umrah');
    });

    it('trims email whitespace', async () => {
      const { body, status } = await callRoute({ email: '  trimmed@example.com  ', type: 'hajj' });
      expect(status).toBe(201);
      expect((body as { email: string }).email).toBe('trimmed@example.com');
    });

    it('persists interest to MockDB', async () => {
      await callRoute({ email: 'persist@example.com', type: 'hajj' });
      const stored = MockDB.getInterests();
      expect(stored.some((i) => i.email === 'persist@example.com' && i.type === 'hajj')).toBe(true);
    });
  });

  describe('deduplication', () => {
    it('returns 200 for duplicate email+type', async () => {
      await callRoute({ email: 'dup@example.com', type: 'hajj' });
      const { body, status } = await callRoute({ email: 'dup@example.com', type: 'hajj' });
      expect(status).toBe(200);
      expect((body as { message: string }).message).toContain('already on the list');
    });

    it('is case-insensitive for email dedup', async () => {
      await callRoute({ email: 'Case@Example.com', type: 'hajj' });
      const { status } = await callRoute({ email: 'case@example.com', type: 'hajj' });
      expect(status).toBe(200);
    });

    it('allows same email with different type', async () => {
      await callRoute({ email: 'both@example.com', type: 'hajj' });
      const { status } = await callRoute({ email: 'both@example.com', type: 'umrah' });
      expect(status).toBe(201);
    });
  });

  describe('validation errors', () => {
    it('returns 400 for missing email', async () => {
      const { status } = await callRoute({ type: 'hajj' });
      expect(status).toBe(400);
    });

    it('returns 400 for invalid email', async () => {
      const { body, status } = await callRoute({ email: 'not-an-email', type: 'hajj' });
      expect(status).toBe(400);
      expect((body as { error: string }).error).toContain('valid email');
    });

    it('returns 400 for missing type', async () => {
      const { status } = await callRoute({ email: 'valid@example.com' });
      expect(status).toBe(400);
    });

    it('returns 400 for invalid type', async () => {
      const { status } = await callRoute({ email: 'valid@example.com', type: 'invalid-type' });
      expect(status).toBe(400);
    });

    it('returns 400 for empty email string', async () => {
      const { status } = await callRoute({ email: '', type: 'hajj' });
      expect(status).toBe(400);
    });

    it('returns 400 for email over 254 chars', async () => {
      const longEmail = 'a'.repeat(245) + '@example.com';
      const { status } = await callRoute({ email: longEmail, type: 'hajj' });
      expect(status).toBe(400);
    });
  });
});
