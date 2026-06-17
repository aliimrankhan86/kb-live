import { describe, expect, it } from 'vitest';
import { packageSchema } from '@/lib/operator/package-schema';
import { mapPackageToComparison } from '@/lib/comparison';
import { ziyaratShort } from '@/lib/packages/display';
import type { Package } from '@/lib/types';

// Minimal valid create payload that SKIPS ziyarat — what the wizard sends when
// an operator leaves the Ziyarat control on "Not specified".
const base = {
  title: 'Umrah package deal',
  pilgrimageType: 'umrah' as const,
  pricePerPerson: 1200,
  priceType: 'from' as const,
  nightsMakkah: 5,
  nightsMadinah: 5,
  totalNights: 10,
};

describe('package-schema — ziyarat is three-state; blank is NEVER coerced to false', () => {
  it('leaves ziyaratIncluded undefined when skipped (not false)', () => {
    const parsed = packageSchema.parse(base);
    expect(parsed.ziyaratIncluded).toBeUndefined();
    expect(parsed.ziyaratIncluded).not.toBe(false);
    expect(parsed.ziyaratDetails).toBeUndefined();
  });

  it('persists ziyaratIncluded=true with details', () => {
    const parsed = packageSchema.parse({
      ...base,
      ziyaratIncluded: true,
      ziyaratDetails: 'Makkah and Madinah ziyarat tours',
    });
    expect(parsed.ziyaratIncluded).toBe(true);
    expect(parsed.ziyaratDetails).toBe('Makkah and Madinah ziyarat tours');
  });

  it('persists ziyaratIncluded=false (operator stated NOT included)', () => {
    const parsed = packageSchema.parse({ ...base, ziyaratIncluded: false });
    expect(parsed.ziyaratIncluded).toBe(false);
  });
});

// Build a full Package from a parsed schema result so we exercise the real
// downstream renderer (the comparison mapper) end to end.
const toPackage = (parsed: ReturnType<typeof packageSchema.parse>): Package =>
  ({
    id: 'pkg-z',
    operatorId: 'op1',
    slug: 'umrah-package-deal',
    seasonLabel: 'Flexible',
    ...parsed,
  }) as unknown as Package;

describe('comparison — ziyarat renders Yes / No / Not provided', () => {
  it('undefined (skipped) → "Not provided"', () => {
    const row = mapPackageToComparison(toPackage(packageSchema.parse(base)));
    expect(row.ziyarat).toBe('Not provided');
  });

  it('true → "Yes"', () => {
    const row = mapPackageToComparison(toPackage(packageSchema.parse({ ...base, ziyaratIncluded: true })));
    expect(row.ziyarat).toBe('Yes');
  });

  it('false → "No"', () => {
    const row = mapPackageToComparison(toPackage(packageSchema.parse({ ...base, ziyaratIncluded: false })));
    expect(row.ziyarat).toBe('No');
  });
});

describe('ziyaratShort helper', () => {
  it('maps the three states and treats null like undefined', () => {
    expect(ziyaratShort(undefined)).toBe('Not provided');
    expect(ziyaratShort(null)).toBe('Not provided');
    expect(ziyaratShort(true)).toBe('Yes');
    expect(ziyaratShort(false)).toBe('No');
  });
});
