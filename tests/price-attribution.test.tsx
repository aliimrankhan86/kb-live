import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatStatedPrice, priceAttribution, priceAttributionShort, priceText } from '@/lib/packages/display';
import { mapPackageToComparison } from '@/lib/comparison';
import { toPackageCardProps } from '@/components/search/search-utils';
import PackageCard from '@/components/search/PackageCard';
import { PackageDetail } from '@/components/packages/PackageDetail';
import type { OperatorProfile, Package } from '@/lib/types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const pkg: Package = {
  id: 'p1', operatorId: 'op1', title: 'T', slug: 't', status: 'published', pilgrimageType: 'umrah',
  priceType: 'from', pricePerPerson: 1495, currency: 'GBP', totalNights: 10, nightsMakkah: 5, nightsMadinah: 5,
  distanceBandMakkah: 'unknown', distanceBandMadinah: 'unknown', updatedAt: '2026-10-01T09:30:00.000Z',
  roomOccupancyOptions: { single: false, double: true, triple: false, quad: false },
  inclusions: { visa: true, flights: true, transfers: false, meals: false },
};
const operator: OperatorProfile = { id: 'op1', companyName: 'Example Operator Ltd', verificationStatus: 'verified', contactEmail: 'a@b.co' };

describe('prices are shown as stated, never converted (standards §6)', () => {
  it('formats the operator price in its own currency', () => {
    expect(formatStatedPrice(1495, 'GBP')).toBe('£1,495');
    expect(formatStatedPrice(1495.5, 'GBP')).toBe('£1,495.50');
    expect(formatStatedPrice(1200, 'USD')).toBe('US$1,200');
    expect(priceText(pkg)).toBe('From £1,495');
  });

  it('the comparison table uses the same price label as cards and the package page', () => {
    expect(mapPackageToComparison(pkg, operator).price).toBe(priceText(pkg));
    expect(mapPackageToComparison({ ...pkg, currency: 'USD' }, operator).price).toBe('From US$1,495');
  });
});

describe('every package price names who stated it and when (standards §6)', () => {
  it('builds the attribution lines', () => {
    expect(priceAttributionShort('Example Operator Ltd', pkg.updatedAt)).toBe('As stated by Example Operator Ltd, updated 1 Oct 2026');
    expect(priceAttribution('Example Operator Ltd', pkg.updatedAt)).toBe(
      'Price per person as stated by Example Operator Ltd, last updated 1 Oct 2026. Confirm the final price with the operator before paying.'
    );
    expect(priceAttributionShort(undefined, undefined)).toBe('As stated by the operator');
  });

  it('the card shows it under the price', () => {
    render(<PackageCard {...toPackageCardProps(pkg)} operator={operator} onAddToShortlist={() => {}} onToggleCompare={() => {}} />);
    expect(screen.getByTestId('price-attribution-p1')).toHaveTextContent('As stated by Example Operator Ltd, updated 1 Oct 2026');
  });

  it('the package page shows it beside the price', () => {
    render(<PackageDetail pkg={pkg} operator={operator} />);
    expect(screen.getByTestId('package-price-attribution')).toHaveTextContent('as stated by Example Operator Ltd, last updated 1 Oct 2026');
  });
});
