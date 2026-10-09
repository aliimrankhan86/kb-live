import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRoot, Root } from 'react-dom/client';
import type { Package } from '@/lib/types';
import { SearchPackagesClient } from '@/components/search/SearchPackagesClient';

// UX-08: the saved list lives on the one /packages list (was PackagesBrowse).
vi.mock('next/navigation', () => {
  const params = new URLSearchParams();
  const router = { replace: vi.fn(), push: vi.fn() };
  return { useSearchParams: () => params, useRouter: () => router, usePathname: () => '/packages' };
});

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ operators: [] }),
}));

const basePackages: Package[] = [
  {
    id: 'pkg-1',
    operatorId: 'op-1',
    title: 'Starter Umrah',
    slug: 'starter-umrah',
    status: 'published',
    pilgrimageType: 'umrah',
    priceType: 'from',
    pricePerPerson: 1200,
    currency: 'GBP',
    totalNights: 7,
    nightsMakkah: 4,
    nightsMadinah: 3,
    distanceBandMakkah: 'near',
    distanceBandMadinah: 'near',
    roomOccupancyOptions: { single: true, double: true, triple: false, quad: false },
    inclusions: { visa: true, flights: false, transfers: true, meals: false },
  },
  {
    id: 'pkg-2',
    operatorId: 'op-1',
    title: 'Comfort Umrah',
    slug: 'comfort-umrah',
    status: 'published',
    pilgrimageType: 'umrah',
    priceType: 'fixed',
    pricePerPerson: 1800,
    currency: 'GBP',
    totalNights: 10,
    nightsMakkah: 5,
    nightsMadinah: 5,
    distanceBandMakkah: 'medium',
    distanceBandMadinah: 'near',
    roomOccupancyOptions: { single: false, double: true, triple: true, quad: false },
    inclusions: { visa: true, flights: true, transfers: true, meals: true },
  },
];

const SHORTLIST_KEY = 'kb_shortlist_packages';

describe('/packages saved list', () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    window.localStorage.clear();
    // Ensure classic JSX runtime has React available in test environment.
    (globalThis as typeof globalThis & { React?: typeof React }).React = React;
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
    }
    container.remove();
  });

  const renderBrowse = async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(<SearchPackagesClient allPackages={basePackages} featuredSlotsEnabled={false} />);
    });
    await act(async () => {
      await Promise.resolve();
    });
  };

  it('loads shortlist from localStorage and persists toggles', async () => {
    window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(['pkg-1', 'pkg-1']));
    await renderBrowse();

    const count = container.querySelector('[data-testid="search-shortlist-count"]');
    expect(count?.textContent).toContain('1');

    const toggle = container.querySelector(
      '[data-testid="shortlist-toggle-pkg-2"]'
    ) as HTMLButtonElement;

    await act(async () => {
      toggle.click();
    });

    await act(async () => {
      await Promise.resolve();
    });

    const stored = JSON.parse(window.localStorage.getItem(SHORTLIST_KEY) ?? '[]');
    expect(stored).toEqual(['pkg-1', 'pkg-2']);
  });

  it('shows only saved packages when the saved chip is pressed, and hides the chip when nothing is saved', async () => {
    await renderBrowse();
    expect(container.querySelector('[data-testid="search-shortlist-count"]')).toBeNull();

    const toggle = container.querySelector('[data-testid="shortlist-toggle-pkg-1"]') as HTMLButtonElement;
    await act(async () => {
      toggle.click();
    });
    const filter = container.querySelector('[data-testid="search-shortlist-count"]') as HTMLButtonElement;
    await act(async () => {
      filter.click();
    });

    expect(filter.getAttribute('aria-pressed')).toBe('true');
    const cards = container.querySelectorAll('[data-testid^="package-card-"]');
    expect(cards.length).toBe(1);
    expect(container.querySelector('[data-testid="package-card-pkg-1"]')).not.toBeNull();
  });

  it('keeps shortlist ids unique when toggling repeatedly', async () => {
    await renderBrowse();

    const toggle = container.querySelector(
      '[data-testid="shortlist-toggle-pkg-1"]'
    ) as HTMLButtonElement;

    await act(async () => {
      toggle.click();
    });
    await act(async () => {
      toggle.click();
    });
    await act(async () => {
      toggle.click();
    });

    await act(async () => {
      await Promise.resolve();
    });

    const stored = JSON.parse(window.localStorage.getItem(SHORTLIST_KEY) ?? '[]');
    expect(stored).toEqual(['pkg-1']);
  });
});
