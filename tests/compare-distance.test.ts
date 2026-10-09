import { describe, expect, it } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';
import { mapPackageToComparison } from '@/lib/comparison';
import { friendlyDistance } from '@/lib/packages/display';
import type { Package } from '@/lib/types';

// UX-01: the compare dialog showed "Makkah near / Madinah near" while the
// package page showed metres. Both now read the same fields the same way.
const base = MockDB.getPackages()[0];
const pkg = (extra: Partial<Package>): Package => ({ ...base, ...extra });

describe('compare distance matches the package page', () => {
  it('shows stated metres and walking time, per city', () => {
    const row = mapPackageToComparison(pkg({
      distanceToHaramMakkahMetres: 350, distanceBandMakkah: 'near',
      distanceToHaramMadinahMetres: 1200, distanceBandMadinah: 'medium',
    }));
    const makkah = friendlyDistance('Makkah', 350, 'near')!;
    expect(row.distance).toBe(
      `Makkah: ${makkah.primary}, ${makkah.note}\nMadinah: 1.2 km from the Prophet's Mosque, about a 15-minute walk`
    );
    expect(row.distance).toContain('350 m from the Haram (Grand Mosque), about a 4-minute walk');
    expect(row.distance).not.toMatch(/Makkah near|Madinah near/);
  });

  it('falls back to the band wording, and "Not provided" per missing city', () => {
    const row = mapPackageToComparison(pkg({
      distanceToHaramMakkahMetres: undefined, distanceBandMakkah: 'near',
      distanceToHaramMadinahMetres: undefined, distanceBandMadinah: 'unknown',
    }));
    expect(row.distance).toBe('Makkah: Near the Haram (Grand Mosque), a short walk\nMadinah: Not provided');
  });

  it('ranks on stated metres before the band', () => {
    const close = mapPackageToComparison(pkg({ distanceToHaramMakkahMetres: 150, distanceBandMakkah: 'medium', distanceBandMadinah: 'unknown', distanceToHaramMadinahMetres: undefined }));
    expect(close.distanceValue).toBe(150);
  });
});
