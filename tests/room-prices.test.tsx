import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { packageSchema, updatePackageSchema } from '@/lib/operator/package-schema';
import { validateStep2 } from '@/components/operator/wizard/WizardStep2Pricing';
import { hasRoomPrices, roomPriceText } from '@/lib/packages/display';
import { mapPackageToComparison } from '@/lib/comparison';
import { ComparisonTable } from '@/components/request/ComparisonTable';
import { PackageDetail } from '@/components/packages/PackageDetail';
import { MockDB } from '@/lib/api/mock-db';
import type { OperatorProfile, Package } from '@/lib/types';

// Item 9 / UX-11: optional operator-stated price per person by room type.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/packages/x',
}));
vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));

const operator: OperatorProfile = { id: 'op-r', companyName: 'Room Test Travel', slug: 'room-test', verificationStatus: 'verified', contactEmail: 'ops@example.com', atolNumber: 'A1' };
const base: Package = {
  ...MockDB.getPackages()[0], id: 'r1', slug: 'r1', operatorId: 'op-r', status: 'published',
  pricePerPerson: 1495, priceType: 'from', currency: 'GBP', totalNights: 10, updatedAt: '2026-10-06T10:00:00.000Z',
  priceQuadPerPerson: undefined, priceTriplePerPerson: undefined, priceDoublePerPerson: undefined,
};
const valid = {
  title: 'Room price package', pilgrimageType: 'umrah', pricePerPerson: 1495, priceType: 'from',
  nightsMakkah: 5, nightsMadinah: 5, totalNights: 10,
};

describe('validation', () => {
  it('accepts a stated positive price, blank (null) or absent for each room type', () => {
    const r = packageSchema.safeParse({ ...valid, priceQuadPerPerson: 1195.5, priceTriplePerPerson: null });
    expect(r.success).toBe(true);
    expect(r.success && r.data.priceQuadPerPerson).toBe(1195.5);
    expect(r.success && r.data.priceTriplePerPerson).toBeNull();
    expect(r.success && r.data.priceDoublePerPerson).toBeUndefined();
  });

  it.each([0, -50, '1200', Number.NaN])('rejects %s, so empty is never stored as zero', (v) => {
    expect(packageSchema.safeParse({ ...valid, priceDoublePerPerson: v }).success).toBe(false);
  });

  it('lets an edit clear a room price with null', () => {
    const r = updatePackageSchema.safeParse({ id: 'r1', priceQuadPerPerson: null });
    expect(r.success && r.data.priceQuadPerPerson).toBeNull();
  });

  it('wizard step 2 explains a non-positive room price and allows blanks', () => {
    const ok = { pricePerPerson: 1495, priceType: 'from' as const };
    expect(validateStep2({ ...ok, priceQuadPerPerson: null, priceTriplePerPerson: undefined })).toBeNull();
    expect(validateStep2({ ...ok, priceTriplePerPerson: 0 })).toBe('Triple room (3 sharing): the price must be greater than 0, or left blank.');
  });

  it('formats a stated price exactly, never converted, and blank as Not provided', () => {
    expect(roomPriceText(1895.5, 'GBP')).toBe('£1,895.50 per person');
    expect(roomPriceText(null, 'GBP')).toBe('Not provided');
    expect(roomPriceText(0, 'GBP')).toBe('Not provided');
    expect(hasRoomPrices(base)).toBe(false);
  });
});

describe('package page "Prices by room type"', () => {
  it('is not shown when no room price is stated', () => {
    render(<PackageDetail pkg={base} operator={operator} />);
    expect(screen.queryByTestId('package-room-prices')).toBeNull();
    expect(screen.queryByText('Prices by room type')).toBeNull();
  });

  it('with one stated: that line is attributed and dated, the others read Not provided', () => {
    render(<PackageDetail pkg={{ ...base, priceDoublePerPerson: 1550 }} operator={operator} />);
    const block = within(screen.getByTestId('package-room-prices'));
    expect(block.getByText('Prices by room type')).toBeTruthy();
    expect(block.getByText('£1,550 per person')).toBeTruthy();
    expect(block.getAllByText('Not provided')).toHaveLength(2);
    expect(block.getAllByText('As stated by Room Test Travel, updated 6 Oct 2026')).toHaveLength(1);
  });

  it('with all three stated: quad, triple, double in order, each attributed and dated', () => {
    render(<PackageDetail pkg={{ ...base, priceQuadPerPerson: 1495, priceTriplePerPerson: 1650, priceDoublePerPerson: 1895.5 }} operator={operator} />);
    const block = screen.getByTestId('package-room-prices');
    const terms = Array.from(block.querySelectorAll('dt')).map((d) => d.textContent);
    expect(terms).toEqual(['Quad room (4 sharing)', 'Triple room (3 sharing)', 'Double room (2 sharing)']);
    expect(block.textContent).toContain('£1,495 per person');
    expect(block.textContent).toContain('£1,895.50 per person');
    expect(within(block).getAllByText('As stated by Room Test Travel, updated 6 Oct 2026')).toHaveLength(3);
    expect(within(block).queryByText('Not provided')).toBeNull();
  });

  it('leaves the headline From price unchanged', () => {
    render(<PackageDetail pkg={{ ...base, priceQuadPerPerson: 999 }} operator={operator} />);
    expect(screen.getByTestId('package-price')).toHaveTextContent('From £1,495');
  });
});

describe('compare table room rows with mixed missing values', () => {
  const rows = [
    mapPackageToComparison({ ...base, id: 'a', priceQuadPerPerson: 1495, priceTriplePerPerson: 1650, priceDoublePerPerson: 1895.5 }, operator),
    mapPackageToComparison({ ...base, id: 'b', priceDoublePerPerson: 1550 }, operator),
    mapPackageToComparison({ ...base, id: 'c' }, operator),
  ];
  const cells = (label: string) => {
    const row = screen.getByRole('rowheader', { name: label }).closest('tr')!;
    return Array.from(row.querySelectorAll('td')).map((td) => td.textContent);
  };

  it('shows one row per room type, each cell the stated price with its attribution, or Not provided', () => {
    render(<ComparisonTable rows={rows} />);
    const stated = 'As stated by Room Test Travel, updated 6 Oct 2026';
    expect(cells('Quad room (4 sharing)')).toEqual([`£1,495 per person\n${stated}`, 'Not provided', 'Not provided']);
    expect(cells('Triple room (3 sharing)')).toEqual([`£1,650 per person\n${stated}`, 'Not provided', 'Not provided']);
    expect(cells('Double room (2 sharing)')).toEqual([`£1,895.50 per person\n${stated}`, `£1,550 per person\n${stated}`, 'Not provided']);
  });

  it('never marks a room price row, so no mark ever compares a missing value', () => {
    render(<ComparisonTable rows={rows} />);
    for (const label of ['Quad room (4 sharing)', 'Triple room (3 sharing)', 'Double room (2 sharing)']) {
      const row = screen.getByRole('rowheader', { name: label }).closest('tr')!;
      expect(row.querySelector('[data-testid="comparison-best"]')).toBeNull();
    }
  });

  it('keeps the headline price in the column header unchanged', () => {
    render(<ComparisonTable rows={rows} />);
    expect(screen.getAllByText('From £1,495')).toHaveLength(3);
  });
});
