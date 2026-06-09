import { describe, it, expect, beforeEach, vi } from 'vitest';

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

vi.mock('../lib/rate-limit', async () => {
  const actual = await vi.importActual<typeof import('../lib/rate-limit')>('../lib/rate-limit');
  return {
    ...actual,
    checkRateLimit: vi.fn(() => ({ limited: false })),
    getRateLimitIdentifier: vi.fn(() => 'test-identifier'),
  };
});

// In-memory store that simulates Supabase unique constraint behaviour
const interestStore: { email: string; type: string }[] = [];

vi.mock('../lib/supabase/service-role', () => ({
  createServiceRoleClient: () => ({
    from: () => ({
      insert: (row: { email: string; type: string }) => {
        const dup = interestStore.some(
          (i) => i.email === row.email && i.type === row.type
        );
        if (dup) return Promise.resolve({ error: { code: '23505' } });
        interestStore.push(row);
        return Promise.resolve({ error: null });
      },
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null }),
          }),
        }),
      }),
    }),
  }),
}));

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
    interestStore.length = 0;
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

    it('trims and lowercases email', async () => {
      const { body, status } = await callRoute({ email: '  Trimmed@Example.com  ', type: 'hajj' });
      expect(status).toBe(201);
      expect((body as { email: string }).email).toBe('trimmed@example.com');
    });

    it('persists interest to store', async () => {
      await callRoute({ email: 'persist@example.com', type: 'hajj' });
      expect(interestStore.some((i) => i.email === 'persist@example.com' && i.type === 'hajj')).toBe(true);
    });
  });

  describe('deduplication', () => {
    it('returns 200 for duplicate email+type', async () => {
      interestStore.push({ email: 'dup@example.com', type: 'hajj' });
      const { body, status } = await callRoute({ email: 'dup@example.com', type: 'hajj' });
      expect(status).toBe(200);
      expect((body as { message: string }).message).toContain('already on the list');
    });

    it('allows same email with different type', async () => {
      interestStore.push({ email: 'both@example.com', type: 'hajj' });
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
