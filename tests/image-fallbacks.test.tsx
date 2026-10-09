import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PackageDetail } from '@/components/packages/PackageDetail';
import PackageCard from '@/components/search/PackageCard';
import { toSearchDisplay } from '@/components/search/search-utils';
import type { Package } from '@/lib/types';

// UX-04: a missing hotel photo showed a pale "Hotel Image" square on the dark
// theme; a cover that failed to load left an empty 16:7 box on the package page.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const pkg: Package = {
  id: 'p1', operatorId: 'op1', title: 'Test package', slug: 'test-package', status: 'published',
  pilgrimageType: 'umrah', priceType: 'from', pricePerPerson: 1495, currency: 'GBP',
  totalNights: 10, nightsMakkah: 5, nightsMadinah: 5, distanceBandMakkah: 'unknown', distanceBandMadinah: 'unknown',
  roomOccupancyOptions: { single: false, double: true, triple: false, quad: false },
  inclusions: { visa: true, flights: true, transfers: true, meals: false },
};
const card = (p: Package) => (
  <PackageCard package={toSearchDisplay(p)} isShortlisted={false} onAddToShortlist={() => {}} onToggleCompare={() => {}} />
);

describe('hotel photo fallback on cards', () => {
  it('shows the themed tile, not a pale placeholder image, when there is no photo', () => {
    expect(toSearchDisplay(pkg).makkahHotel.image).toBe('');
    const { container } = render(card(pkg));
    expect(screen.getAllByTestId('hotel-thumb-fallback')).toHaveLength(2);
    expect(container.querySelector('img')).toBeNull();
  });

  it('swaps a photo that fails to load for the tile', () => {
    const { container } = render(card({ ...pkg, images: ['https://example.com/broken.jpg'] }));
    container.querySelectorAll('img').forEach((img) => fireEvent.error(img));
    expect(screen.getAllByTestId('hotel-thumb-fallback')).toHaveLength(2);
  });
});

describe('package page hero', () => {
  it('is not rendered without a photo', () => {
    render(<PackageDetail pkg={{ ...pkg, images: [] }} />);
    expect(screen.queryByTestId('package-image-gallery')).toBeNull();
  });

  it('collapses when the photo fails to load', () => {
    render(<PackageDetail pkg={{ ...pkg, images: ['https://example.com/broken.jpg'] }} />);
    fireEvent.error(screen.getByTestId('package-image-primary'));
    expect(screen.queryByTestId('package-image-gallery')).toBeNull();
  });
});
