import { describe, expect, it } from 'vitest';
import { createQuotePrefillUrl } from '@/lib/quote-prefill';
import type { Package } from '@/lib/types';

const basePackage: Package = {
  id: 'pkg-1',
  operatorId: 'op1',
  title: 'Umrah package',
  slug: 'umrah-package',
  status: 'published',
  pilgrimageType: 'umrah',
  seasonLabel: 'Flexible',
  priceType: 'from',
  pricePerPerson: 1200,
  currency: 'GBP',
  totalNights: 10,
  nightsMakkah: 5,
  nightsMadinah: 5,
  distanceBandMakkah: 'near',
  distanceBandMadinah: 'near',
  roomOccupancyOptions: { single: true, double: true, triple: true, quad: true },
  inclusions: { visa: true, flights: true, transfers: true, meals: false },
};

const paramsOf = (pkg: Package) => new URLSearchParams(createQuotePrefillUrl(pkg).split('?')[1]);

describe('createQuotePrefillUrl — data integrity (no fabricated star preference)', () => {
  it('omits hotelStars when the operator supplied no rating', () => {
    const params = paramsOf(basePackage);
    expect(params.has('hotelStars')).toBe(false);
  });

  it('seeds hotelStars from the operator-supplied rating when present', () => {
    expect(paramsOf({ ...basePackage, hotelMakkahStars: 5 }).get('hotelStars')).toBe('5');
    expect(paramsOf({ ...basePackage, hotelMadinahStars: 3 }).get('hotelStars')).toBe('3');
  });
});
