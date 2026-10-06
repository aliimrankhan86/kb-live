import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PackageDetail } from '@/components/packages/PackageDetail';
import { ATOL_STANDARD_LINE, CONTRACT_STANDARD_LINE } from '@/lib/content-rules';
import type { OperatorProfile, Package } from '@/lib/types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const pkg: Package = {
  id: 'p1', operatorId: 'op1', title: 'Test package', slug: 'test-package', status: 'published',
  pilgrimageType: 'umrah', priceType: 'from', pricePerPerson: 1495, currency: 'GBP',
  totalNights: 10, nightsMakkah: 5, nightsMadinah: 5,
  hotelMakkahStars: 4, // Madinah stars deliberately missing
  distanceBandMakkah: 'unknown', distanceBandMadinah: 'unknown',
  dateWindow: { start: '2026-12-18', end: '2026-12-28' },
  roomOccupancyOptions: { single: false, double: true, triple: false, quad: false },
  inclusions: { visa: true, flights: true, transfers: true, meals: false },
};

const operator: OperatorProfile = {
  id: 'op1', companyName: 'Test Operator', verificationStatus: 'verified', contactEmail: 'ops@example.com',
  atolNumber: '12345', atolVerifiedAt: '2026-06-01T00:00:00.000Z',
  abtaMemberNumber: 'P1234', abtaVerifiedAt: '2026-06-01T00:00:00.000Z',
};

describe('package page: protection + data truth (standards §3.4, §5, §7)', () => {
  it('never contradicts the verification statement or over-claims ABTA', () => {
    const { container } = render(<PackageDetail pkg={pkg} operator={operator} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/does not verify ATOL/i);
    expect(text).not.toMatch(/Verified by PilgrimCompare/);
    expect(text).not.toMatch(/dispute resolution and booking protection/);
    expect(text).toContain(ATOL_STANDARD_LINE);
    expect(text).toContain(CONTRACT_STANDARD_LINE);
    expect(screen.getByTestId('package-abta')).toHaveTextContent('(provided by the operator)');
    expect(screen.getByTestId('atol-verified-badge')).toHaveTextContent('checked against the CAA register on 1 Jun 2026');
  });

  it('shows Not provided instead of "?★" for a missing star rating', () => {
    const { container } = render(<PackageDetail pkg={pkg} operator={operator} />);
    expect(container.textContent).not.toContain('?★');
    expect(container.textContent).toContain('Madinah Not provided');
  });

  it('links "Verified operator" to the verification statement', () => {
    render(<PackageDetail pkg={pkg} operator={operator} />);
    expect(screen.getByRole('link', { name: 'Verified operator' })).toHaveAttribute('href', '/how-we-rank#verification-heading');
  });

  it('formats travel dates the same way as the cards', () => {
    const { container } = render(<PackageDetail pkg={pkg} operator={operator} />);
    expect(container.textContent).toContain('18 Dec 2026 to 28 Dec 2026');
  });
});
