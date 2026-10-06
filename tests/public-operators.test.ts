import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/operators/route';
import { MockDB } from '@/lib/api/mock-db';

describe('GET /api/operators (public)', () => {
  it('never exposes internal eligibility flags', async () => {
    const seeded = MockDB.getOperators();
    expect(seeded.some((o) => o.eligibilityFlags)).toBe(true);
    const body = await (await GET()).json();
    expect(body.operators.length).toBe(seeded.length);
    for (const op of body.operators) {
      expect(op).not.toHaveProperty('eligibilityFlags');
      expect(JSON.stringify(op)).not.toMatch(/paymentSlaFlagged|bankDetailsActive|canReceiveBookings/);
    }
  });
});
