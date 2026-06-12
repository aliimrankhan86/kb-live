import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyCronSecret } from '@/lib/cron-auth';
import type { NextRequest } from 'next/server';

function makeRequest(authHeader?: string): NextRequest {
  return {
    headers: {
      get: (name: string) =>
        name === 'authorization' ? (authHeader ?? null) : null,
    },
  } as unknown as NextRequest;
}

describe('verifyCronSecret', () => {
  const originalEnv = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret-abc123';
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalEnv;
  });

  it('returns true when Authorization header matches', () => {
    const req = makeRequest('Bearer test-secret-abc123');
    expect(verifyCronSecret(req)).toBe(true);
  });

  it('returns false when Authorization header is missing', () => {
    const req = makeRequest();
    expect(verifyCronSecret(req)).toBe(false);
  });

  it('returns false when Authorization header is wrong secret', () => {
    const req = makeRequest('Bearer wrong-secret');
    expect(verifyCronSecret(req)).toBe(false);
  });

  it('returns false when Authorization header lacks Bearer prefix', () => {
    const req = makeRequest('test-secret-abc123');
    expect(verifyCronSecret(req)).toBe(false);
  });

  it('returns false when CRON_SECRET env var is not set', () => {
    delete process.env.CRON_SECRET;
    const req = makeRequest('Bearer test-secret-abc123');
    expect(verifyCronSecret(req)).toBe(false);
  });
});

describe('cron route 401 guards', () => {
  // Integration smoke: confirm each cron route handler returns 401 without the secret.
  // Full DB-dependent paths are covered by manual curl testing (see AI_NOTES §23).

  it('nudge-operators returns 401 without secret', async () => {
    vi.stubEnv('CRON_SECRET', 'real-secret');
    const { GET } = await import('@/app/api/cron/nudge-operators/route');
    const req = makeRequest(); // no Authorization header
    const res = await GET(req as NextRequest);
    expect(res.status).toBe(401);
    vi.unstubAllEnvs();
  });

  it('outcome-followup returns 401 without secret', async () => {
    vi.stubEnv('CRON_SECRET', 'real-secret');
    const { GET } = await import('@/app/api/cron/outcome-followup/route');
    const req = makeRequest();
    const res = await GET(req as NextRequest);
    expect(res.status).toBe(401);
    vi.unstubAllEnvs();
  });

  it('expire-packages returns 401 without secret', async () => {
    vi.stubEnv('CRON_SECRET', 'real-secret');
    const { GET } = await import('@/app/api/cron/expire-packages/route');
    const req = makeRequest();
    const res = await GET(req as NextRequest);
    expect(res.status).toBe(401);
    vi.unstubAllEnvs();
  });
});
