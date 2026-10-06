import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { inclusionLabel } from '@/lib/packages/display';
import { mapPackageToComparison } from '@/lib/comparison';
import { packageSchema } from '@/lib/operator/package-schema';
import { Repository } from '@/lib/api/repository';
import { PackageDetail } from '@/components/packages/PackageDetail';
import { WizardStep5Inclusions } from '@/components/operator/wizard/WizardStep5Inclusions';
import type { Package } from '@/lib/types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const pkg = (inclusions: Package['inclusions']): Package => ({
  id: 'p1', operatorId: 'op1', title: 'Three state', slug: 'three-state', status: 'published', pilgrimageType: 'umrah',
  priceType: 'from', pricePerPerson: 1000, currency: 'GBP', totalNights: 7, nightsMakkah: 4, nightsMadinah: 3,
  distanceBandMakkah: 'unknown', distanceBandMadinah: 'unknown',
  roomOccupancyOptions: { single: false, double: true, triple: false, quad: false }, inclusions,
});

describe('inclusions are yes / no / not stated (founder decision 2026-10-06)', () => {
  it('labels each state', () => {
    expect(inclusionLabel(true)).toBe('Included');
    expect(inclusionLabel(false)).toBe('Not included');
    expect(inclusionLabel(null)).toBe('Not provided');
  });

  it('the package page shows Not provided for unstated items, not "Not included"', () => {
    render(<PackageDetail pkg={pkg({ visa: true, flights: false, transfers: null, meals: null })} />);
    const list = screen.getByTestId('package-inclusions').textContent ?? '';
    expect(list).toContain('Visa: Included');
    expect(list).toContain('Flights: Not included');
    expect(list).toContain('Transfers: Not provided');
    expect(list).toContain('Meals: Not provided');
  });

  it('comparison says None only when every item was stated as not included', () => {
    expect(mapPackageToComparison(pkg({ visa: false, flights: false, transfers: false, meals: false })).inclusions).toBe('None');
    expect(mapPackageToComparison(pkg({ visa: false, flights: null, transfers: false, meals: false })).inclusions).toBe('Not provided');
  });

  it('a skipped wizard step saves not stated (null), never false', () => {
    const parsed = packageSchema.safeParse({
      title: 'Package title', pilgrimageType: 'umrah', pricePerPerson: 1000, priceType: 'from',
      nightsMakkah: 4, nightsMadinah: 3, totalNights: 7,
    });
    expect(parsed.success && parsed.data.inclusions).toEqual({ visa: null, flights: null, transfers: null, meals: null });
    render(<WizardStep5Inclusions data={{}} onChange={() => {}} error={null} />);
    expect(screen.getByTestId('wizard-inclusion-visa-unspecified')).toBeChecked();
  });

  it('CSV import keeps blanks as not stated and round-trips', async () => {
    localStorage.clear();
    const ctx = { userId: 'op-three', role: 'operator' as const };
    const { saved } = await Repository.importPackagesFromCsv(ctx, 'title,pricePerPerson,currency,totalNights,pilgrimageType,visa,flights,transfers,meals\nThree,900,GBP,7,umrah,true,false,,');
    expect(saved[0].inclusions).toEqual({ visa: true, flights: false, transfers: null, meals: null });
  });
});
