import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { isBookingFlowEnabled, isRfqQuoteEnabled, isOperatorSelfServeEnabled } from '@/lib/config';
import { PackageDetail } from '@/components/packages/PackageDetail';
import type { Package } from '@/lib/types';

// PackageDetail is a client component that uses next/navigation.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

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

describe('parked-feature flags (lib/config)', () => {
  it('default OFF when the env vars are unset (the live pilgrim journey state)', () => {
    // Vitest runs with FEATURE_BOOKING_FLOW / FEATURE_RFQ_QUOTE /
    // FEATURE_OPERATOR_SELF_SERVE unset.
    expect(isBookingFlowEnabled()).toBe(false);
    expect(isRfqQuoteEnabled()).toBe(false);
    expect(isOperatorSelfServeEnabled()).toBe(false);
  });
});

describe('PackageDetail — RFQ quote CTA gating (PARKED_FEATURES.md entry 2)', () => {
  it('hides the "Request quote" CTA when rfqEnabled is false (default / flag OFF)', () => {
    render(<PackageDetail pkg={basePackage} />);
    expect(screen.queryByTestId('package-cta-request-quote')).not.toBeInTheDocument();
    expect(screen.queryByTestId('package-mobile-cta-request-quote')).not.toBeInTheDocument();
  });

  it('shows the "Request quote" CTA only when rfqEnabled is true (flag ON)', () => {
    render(<PackageDetail pkg={basePackage} rfqEnabled />);
    expect(screen.getByTestId('package-cta-request-quote')).toBeInTheDocument();
    expect(screen.getByTestId('package-mobile-cta-request-quote')).toBeInTheDocument();
  });
});
