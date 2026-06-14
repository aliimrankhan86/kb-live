import { describe, expect, it } from 'vitest';
import { packageSchema } from '@/lib/operator/package-schema';
import { mapPackageToComparison } from '@/lib/comparison';
import type { Package } from '@/lib/types';

// Minimal valid create payload that SKIPS hotel stars, distance band, and group
// type — exactly what the wizard sends when an operator leaves those untouched.
const skippedPayload = {
  title: 'Umrah package deal',
  pilgrimageType: 'umrah' as const,
  pricePerPerson: 1200,
  priceType: 'from' as const,
  nightsMakkah: 5,
  nightsMadinah: 5,
  totalNights: 10,
};

describe('package-schema — skipped fields stay unset (no silent defaults)', () => {
  it('defaults distance band to the "unknown" sentinel, never "medium"', () => {
    const parsed = packageSchema.parse(skippedPayload);
    expect(parsed.distanceBandMakkah).toBe('unknown');
    expect(parsed.distanceBandMadinah).toBe('unknown');
  });

  it('leaves hotel stars and group type absent when skipped', () => {
    const parsed = packageSchema.parse(skippedPayload);
    expect(parsed.hotelMakkahStars).toBeUndefined();
    expect(parsed.hotelMadinahStars).toBeUndefined();
    expect(parsed.groupType).toBeUndefined();
  });

  it('preserves operator-chosen values unchanged', () => {
    const parsed = packageSchema.parse({
      ...skippedPayload,
      hotelMakkahStars: 5,
      hotelMadinahStars: 4,
      distanceBandMakkah: 'near',
      distanceBandMadinah: 'far',
      groupType: 'private',
    });
    expect(parsed.hotelMakkahStars).toBe(5);
    expect(parsed.hotelMadinahStars).toBe(4);
    expect(parsed.distanceBandMakkah).toBe('near');
    expect(parsed.distanceBandMadinah).toBe('far');
    expect(parsed.groupType).toBe('private');
  });
});

// Build a full Package from a parsed schema result so we exercise the real
// downstream renderer (the comparison grid) end to end.
const toPackage = (parsed: ReturnType<typeof packageSchema.parse>): Package =>
  ({
    id: 'pkg-1',
    operatorId: 'op1',
    slug: 'umrah-package-deal',
    seasonLabel: 'Flexible',
    ...parsed,
  }) as unknown as Package;

describe('downstream — unset wizard fields render "Not provided"', () => {
  it('shows "Not provided" for skipped stars, distance, and group type', () => {
    const row = mapPackageToComparison(toPackage(packageSchema.parse(skippedPayload)));
    expect(row.hotelRating).toBe('Not provided');
    expect(row.distance).toBe('Not provided');
    expect(row.groupType).toBe('Not provided');
  });

  it('shows the chosen values when the operator selected them', () => {
    const row = mapPackageToComparison(
      toPackage(
        packageSchema.parse({
          ...skippedPayload,
          hotelMakkahStars: 5,
          hotelMadinahStars: 4,
          distanceBandMakkah: 'near',
          distanceBandMadinah: 'far',
          groupType: 'private',
        })
      )
    );
    expect(row.hotelRating).toBe('Makkah 5 / Madinah 4');
    expect(row.distance).toBe('Makkah near / Madinah far');
    expect(row.groupType).toBe('Private');
  });
});
