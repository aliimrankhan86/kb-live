'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PackageList from './PackageList';
import type { Package as CataloguePackage } from '@/lib/types';
import { filterByParams, toSearchDisplay } from './search-utils';
import styles from './packages.module.css';

interface SearchPackagesClientProps {
  allPackages: CataloguePackage[];
  featuredSlotsEnabled: boolean;
}

const VALID_SORTS = ['relevance', 'price-asc', 'price-desc', 'rating', 'distance'] as const;
type SortOption = typeof VALID_SORTS[number];
const toSortOption = (v: string | null): SortOption =>
  VALID_SORTS.includes(v as SortOption) ? (v as SortOption) : 'relevance';

export function SearchPackagesClient({ allPackages, featuredSlotsEnabled }: SearchPackagesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filteredPackages = useMemo(
    () => filterByParams(allPackages, searchParams ?? new URLSearchParams()),
    [allPackages, searchParams]
  );

  const displayPackages = useMemo(
    () => filteredPackages.map(toSearchDisplay),
    [filteredPackages]
  );

  const sortBy = toSortOption(searchParams?.get('sort') ?? null);

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('sort', sort);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return (
    <main className={styles.searchPage}>
      <h1 className="sr-only">Search Results - Hajj and Umrah Packages</h1>
      <PackageList
        packages={displayPackages}
        cataloguePackages={filteredPackages}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        featuredSlotsEnabled={featuredSlotsEnabled}
      />
    </main>
  );
}
