import { describe, expect, it } from 'vitest';
import { packageJsonLd } from '@/lib/seo/json-ld';
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

const ratingProps = (jsonLd: Record<string, unknown>) =>
  (jsonLd.additionalProperty as Array<{ name: string }>).filter((p) => p.name.includes('hotel rating'));

describe('packageJsonLd — data integrity (missing stars omitted, never 0)', () => {
  it('omits the hotel rating property entirely when stars are absent', () => {
    const jsonLd = packageJsonLd(basePackage, 'Test Operator');

    // No rating PropertyValue at all — not null, not 0, not empty.
    expect(ratingProps(jsonLd)).toHaveLength(0);
    // And no fabricated "★" claim in the human-readable description.
    expect(String(jsonLd.description)).not.toContain('★');
    expect(String(jsonLd.description)).not.toContain('0★');
  });

  it('emits the rating property only for the city whose stars exist', () => {
    const jsonLd = packageJsonLd({ ...basePackage, hotelMakkahStars: 5 }, 'Test Operator');
    const props = ratingProps(jsonLd);

    expect(props).toEqual([{ '@type': 'PropertyValue', name: 'Makkah hotel rating', value: '5' }]);
    expect(String(jsonLd.description)).toContain('5★ Makkah');
    expect(String(jsonLd.description)).not.toContain('Madinah.');
  });

  it('emits both rating properties when both cities have stars', () => {
    const jsonLd = packageJsonLd(
      { ...basePackage, hotelMakkahStars: 5, hotelMadinahStars: 4 },
      'Test Operator'
    );

    expect(ratingProps(jsonLd)).toEqual([
      { '@type': 'PropertyValue', name: 'Makkah hotel rating', value: '5' },
      { '@type': 'PropertyValue', name: 'Madinah hotel rating', value: '4' },
    ]);
  });
});
