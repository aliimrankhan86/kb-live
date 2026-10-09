import { describe, expect, it, vi } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import nextConfig from '../next.config';
import sitemap from '@/app/sitemap';
import { SearchPackagesClient } from '@/components/search/SearchPackagesClient';
import { MockDB } from '@/lib/api/mock-db';

// UX-08 option B: one package list at /packages; /search/packages answers 308.
const replace = vi.fn();
const params = new URLSearchParams('type=umrah&departureAirport=LHR');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => '/packages',
  useSearchParams: () => params,
}));

const OLD = /\/search\/packages(?!\.module)/;
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === 'generated' || name === 'node_modules') return [];
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|mjs|js)$/.test(name) ? [path] : [];
  });

describe('/search/packages', () => {
  it('is a permanent (308) redirect to /packages in the framework config', async () => {
    // Next answers permanent: true with 308 and passes the query string through.
    expect(await nextConfig.redirects!()).toEqual([
      { source: '/search/packages', destination: '/packages', permanent: true },
    ]);
  });

  it('has no page of its own any more', () => {
    expect(() => statSync('app/search/packages/page.tsx')).toThrow();
  });

  it('is not in the sitemap', async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.some((u) => u.endsWith('/packages'))).toBe(true);
    expect(urls.filter((u) => OLD.test(u))).toEqual([]);
  });

  it('is not linked, canonical or alternate anywhere in app, components or lib', () => {
    const hits = ['app', 'components', 'lib'].flatMap(sourceFiles)
      .filter((f) => OLD.test(stripComments(readFileSync(f, 'utf8'))));
    expect(hits).toEqual([]);
  });
});

describe('/packages list', () => {
  it('keeps the pilgrimage type in the URL and shows the filter panel button', () => {
    const pkgs = MockDB.getPackages().map((p) => ({ ...p, status: 'published' as const }));
    render(<SearchPackagesClient allPackages={pkgs} featuredSlotsEnabled={false} />);
    expect(screen.getByTestId('packages-type-umrah')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('filter-button')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Remove filter: From/ })).toBeTruthy();

    fireEvent.click(screen.getByTestId('packages-type-hajj'));
    expect(replace).toHaveBeenLastCalledWith('/packages?type=hajj&departureAirport=LHR', { scroll: false });
    fireEvent.click(screen.getByTestId('packages-type-all'));
    expect(replace).toHaveBeenLastCalledWith('/packages?departureAirport=LHR', { scroll: false });
  });
});
