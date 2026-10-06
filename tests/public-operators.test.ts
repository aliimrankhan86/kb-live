import { describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/operators/route';
import { MockDB } from '@/lib/api/mock-db';

vi.mock('@/lib/auth/session', () => ({ getSessionUser: async () => null }));

describe('GET /api/operators (public)', () => {
  it('lists only verified operators, with no internal state (SLA flag, onboarding progress)', async () => {
    const seeded = MockDB.getOperators();
    expect(seeded.some((o) => o.eligibilityFlags)).toBe(true);
    const verified = seeded.filter((o) => o.verificationStatus === 'verified');
    const body = await (await GET()).json();
    expect(body.operators.map((o: { id: string }) => o.id).sort()).toEqual(verified.map((o) => o.id).sort());
    for (const op of body.operators) {
      expect(JSON.stringify(op)).not.toMatch(/paymentSlaFlagged|onboardingComplete/);
    }
  });
});
