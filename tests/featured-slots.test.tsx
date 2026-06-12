import React, { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { createRoot, Root } from 'react-dom/client';
import type { SearchPackageDisplay } from '@/components/search/search-utils';

// --- next/navigation mock ---------------------------------------------------
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/search/packages',
}));

// --- next/link mock ----------------------------------------------------------
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// --- fetch stub for operators ------------------------------------------------
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ operators: [] }),
}));

// --- localStorage stub -------------------------------------------------------
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// ---------------------------------------------------------------------------

const makePackage = (id: string, isFeatured: boolean): SearchPackageDisplay => ({
  id,
  slug: id,
  departure: { date: '2026-09-01', duration: '5h 30m', route: 'LHR → JED' },
  return: { date: '2026-09-15', duration: '5h 30m', route: 'JED → LHR' },
  makkahHotel: { name: `Makkah Hotel ${id}`, location: 'Makkah', rating: 4, distance: '200m', image: '' },
  madinaHotel: { name: `Madinah Hotel ${id}`, location: 'Madinah', rating: 4, distance: '300m', image: '' },
  price: 1500,
  currency: 'GBP',
  priceNote: 'per person',
  isFeatured,
});

async function renderPackageList(
  packages: SearchPackageDisplay[],
  featuredSlotsEnabled: boolean
): Promise<{ container: HTMLElement; root: Root }> {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const { default: PackageList } = await import('@/components/search/PackageList');

  let root!: Root;
  await act(async () => {
    root = createRoot(container);
    root.render(
      <PackageList
        packages={packages}
        featuredSlotsEnabled={featuredSlotsEnabled}
      />
    );
  });

  return { container, root };
}

describe('Featured slots — flag OFF (default)', () => {
  it('does not render featured section when flag is false', async () => {
    const pkgs = [
      makePackage('pkg-featured', true),
      makePackage('pkg-normal', false),
    ];
    const { container, root } = await renderPackageList(pkgs, false);

    expect(container.querySelector('[data-testid="featured-section"]')).toBeNull();

    await act(async () => { root.unmount(); });
    document.body.removeChild(container);
  });

  it('renders all packages in normal results when flag is false', async () => {
    const pkgs = [
      makePackage('pkg-featured', true),
      makePackage('pkg-normal', false),
    ];
    const { container, root } = await renderPackageList(pkgs, false);

    const normalSection = container.querySelector('[aria-label="Search results"]');
    expect(normalSection).not.toBeNull();
    // Both appear in normal list (identified by data-testid)
    expect(normalSection!.querySelector('[data-testid="package-card-pkg-featured"]')).not.toBeNull();
    expect(normalSection!.querySelector('[data-testid="package-card-pkg-normal"]')).not.toBeNull();

    await act(async () => { root.unmount(); });
    document.body.removeChild(container);
  });
});

describe('Featured slots — flag ON', () => {
  it('renders the featured section when flag is true and isFeatured packages exist', async () => {
    const pkgs = [
      makePackage('pkg-featured', true),
      makePackage('pkg-normal', false),
    ];
    const { container, root } = await renderPackageList(pkgs, true);

    expect(container.querySelector('[data-testid="featured-section"]')).not.toBeNull();

    await act(async () => { root.unmount(); });
    document.body.removeChild(container);
  });

  it('featured section has "Paid placement" label text', async () => {
    const pkgs = [makePackage('pkg-f1', true), makePackage('pkg-normal', false)];
    const { container, root } = await renderPackageList(pkgs, true);

    const featuredSection = container.querySelector('[data-testid="featured-section"]');
    expect(featuredSection!.textContent).toContain('Paid placement');

    await act(async () => { root.unmount(); });
    document.body.removeChild(container);
  });

  it('featured section links to /how-we-rank', async () => {
    const pkgs = [makePackage('pkg-f1', true), makePackage('pkg-normal', false)];
    const { container, root } = await renderPackageList(pkgs, true);

    const featuredSection = container.querySelector('[data-testid="featured-section"]');
    const link = featuredSection!.querySelector('a[href="/how-we-rank"]');
    expect(link).not.toBeNull();

    await act(async () => { root.unmount(); });
    document.body.removeChild(container);
  });

  it('caps featured packages at 2 even when more are isFeatured', async () => {
    const pkgs = [
      makePackage('pkg-f1', true),
      makePackage('pkg-f2', true),
      makePackage('pkg-f3', true),
      makePackage('pkg-normal', false),
    ];
    const { container, root } = await renderPackageList(pkgs, true);

    const featuredSection = container.querySelector('[data-testid="featured-section"]');
    // PackageCards inside featured section — count heading elements as proxy
    const cards = featuredSection!.querySelectorAll('[data-testid^="package-card"]');
    expect(cards.length).toBeLessThanOrEqual(2);

    await act(async () => { root.unmount(); });
    document.body.removeChild(container);
  });

  it('featured package does NOT appear in neutral results section', async () => {
    const pkgs = [
      makePackage('pkg-f1', true),
      makePackage('pkg-normal', false),
    ];
    const { container, root } = await renderPackageList(pkgs, true);

    const neutralSection = container.querySelector('[aria-label="Search results"]');
    expect(neutralSection!.querySelector('[data-testid="package-card-pkg-f1"]')).toBeNull();
    expect(neutralSection!.querySelector('[data-testid="package-card-pkg-normal"]')).not.toBeNull();

    await act(async () => { root.unmount(); });
    document.body.removeChild(container);
  });

  it('does not render featured section when no packages have isFeatured=true', async () => {
    const pkgs = [makePackage('pkg-1', false), makePackage('pkg-2', false)];
    const { container, root } = await renderPackageList(pkgs, true);

    expect(container.querySelector('[data-testid="featured-section"]')).toBeNull();

    await act(async () => { root.unmount(); });
    document.body.removeChild(container);
  });
});

describe('sort-disclosure — always rendered', () => {
  it('renders sort disclosure text in PackageList', async () => {
    const pkgs = [makePackage('pkg-1', false)];
    const { container, root } = await renderPackageList(pkgs, false);

    const disclosure = container.querySelector('[data-testid="sort-disclosure"]');
    expect(disclosure).not.toBeNull();
    expect(disclosure!.textContent).toContain('No operator pays for ranking');

    await act(async () => { root.unmount(); });
    document.body.removeChild(container);
  });

  it('sort disclosure links to /how-we-rank', async () => {
    const pkgs = [makePackage('pkg-1', false)];
    const { container, root } = await renderPackageList(pkgs, false);

    const disclosure = container.querySelector('[data-testid="sort-disclosure"]');
    const link = disclosure!.querySelector('a[href="/how-we-rank"]');
    expect(link).not.toBeNull();

    await act(async () => { root.unmount(); });
    document.body.removeChild(container);
  });
});
