import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRoot, Root } from 'react-dom/client';
import type { Package } from '@/lib/types';
import { PackagesBrowse } from '@/components/packages/PackagesBrowse';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/api/mock-db', () => ({
  MockDB: {
    getOperators: () => [],
  },
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

describe('PackagesBrowse shortlist', () => {
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
      root?.render(<PackagesBrowse packages={basePackages} />);
    });
    await act(async () => {
      await Promise.resolve();
    });
  };

  it('loads shortlist from localStorage and persists toggles', async () => {
    window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(['pkg-1']));
    await renderBrowse();

    const count = container.querySelector('[data-testid="shortlist-count"]');
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

  it('filters by shortlist and shows empty state when none', async () => {
    await renderBrowse();

    const filter = container.querySelector('[data-testid="shortlist-filter"]') as HTMLInputElement;
    await act(async () => {
      filter.click();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('[data-testid="shortlist-empty"]')).not.toBeNull();

    await act(async () => {
      filter.click();
    });

    const toggle = container.querySelector(
      '[data-testid="shortlist-toggle-pkg-1"]'
    ) as HTMLButtonElement;

    await act(async () => {
      toggle.click();
    });

    await act(async () => {
      filter.click();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('[data-testid="shortlist-empty"]')).toBeNull();
    const cards = container.querySelectorAll('[data-testid^="package-card-"]');
    expect(cards.length).toBe(1);
  });
});
