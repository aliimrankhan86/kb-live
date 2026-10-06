import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('@/lib/api/db/prisma', () => ({ prisma: { $queryRaw: async () => { throw new Error('password authentication failed for user "postgres" at db.internal:5432'); } } }));

describe('internal error details never reach the public', () => {
  it('/api/health reports degraded without the DB error text', async () => {
    const { GET } = await import('@/app/api/health/route');
    const res = await GET();
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toMatch(/password|postgres|db\.internal/);
  });
  it('package, packages and operator pages show a fixed message, not err.message', () => {
    for (const f of ['app/packages/page.tsx', 'app/packages/[slug]/page.tsx', 'app/operators/[slug]/page.tsx']) {
      expect(readFileSync(f, 'utf8')).not.toMatch(/error = err instanceof Error \? err\.message/);
    }
  });
});
