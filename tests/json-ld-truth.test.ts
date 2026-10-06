import { describe, expect, it } from 'vitest';
import { operatorJsonLd, packageJsonLd, touristTripJsonLd } from '@/lib/seo/json-ld';
import type { OperatorProfile, Package } from '@/lib/types';

const pkg: Package = {
  id: 'p1', operatorId: 'op1', title: 'Test', slug: 'test', status: 'published', pilgrimageType: 'umrah',
  priceType: 'from', pricePerPerson: 1495, currency: 'GBP', totalNights: 10, nightsMakkah: 0, nightsMadinah: 0,
  distanceBandMakkah: 'unknown', distanceBandMadinah: 'unknown',
  dateWindow: { start: '2026-12-18', end: '2026-12-28' },
  roomOccupancyOptions: { single: false, double: true, triple: false, quad: false },
  inclusions: { visa: true, flights: true, transfers: false, meals: false },
};

describe('structured data states only stored operator facts (standards §3.4, §6, §13)', () => {
  it('Product: no invented nights split, availability or validity window', () => {
    const json = JSON.stringify(packageJsonLd(pkg, 'Test Operator'));
    expect(json).not.toMatch(/InStock|availability|validFrom|validThrough/);
    expect(json).not.toMatch(/\(5 Makkah, 5 Madinah\)|Makkah nights/);
    expect(json).toContain('"price":"1495"');
    expect(json).toContain('"name":"Test Operator"');
  });

  it('TouristTrip: no invented split, no "near the Grand Mosque" claim', () => {
    const json = JSON.stringify(touristTripJsonLd({ ...pkg, nightsMakkah: 6, nightsMadinah: 4 }, 'Test Operator'));
    expect(json).not.toMatch(/InStock|near the Grand Mosque|near the Prophet/);
    expect(json).toContain('6 nights in Makkah');
  });

  it('Organization: no foundingDate computed from years in business', () => {
    const op: OperatorProfile = { id: 'op1', companyName: 'Test Operator', verificationStatus: 'verified', contactEmail: 'a@b.c', yearsInBusiness: 12 };
    expect(JSON.stringify(operatorJsonLd(op))).not.toContain('foundingDate');
  });
});
