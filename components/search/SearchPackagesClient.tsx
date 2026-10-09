'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PackageList from './PackageList';
import type { Package as CataloguePackage, OperatorProfile } from '@/lib/types';
import { liveAirportOptions, searchPackages, toSearchDisplay } from './search-utils';
import styles from './packages.module.css';

interface SearchPackagesClientProps {
  allPackages: CataloguePackage[];
  featuredSlotsEnabled: boolean;
  operators?: OperatorProfile[];
  /** Preselected for comparison, from /packages?compare=<id> (package page "Compare"). */
  initialCompareIds?: string[];
}

const VALID_SORTS = ['relevance', 'price-asc', 'price-desc', 'rating', 'distance'] as const;
type SortOption = typeof VALID_SORTS[number];
const toSortOption = (v: string | null): SortOption =>
  VALID_SORTS.includes(v as SortOption) ? (v as SortOption) : 'relevance';

export function SearchPackagesClient({ allPackages, featuredSlotsEnabled, operators, initialCompareIds }: SearchPackagesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const result = useMemo(
    () => searchPackages(allPackages, searchParams ?? new URLSearchParams()),
    [allPackages, searchParams]
  );
  const filteredPackages = result.matches;
  const closeMatches = useMemo(
    () => result.closeMatches.map((m) => ({ pkg: m.pkg, unmet: m.unmet.map((u) => u.reason) })),
    [result]
  );

  const displayPackages = useMemo(
    () => filteredPackages.map(toSearchDisplay),
    [filteredPackages]
  );

  const airportOptions = useMemo(() => liveAirportOptions(allPackages), [allPackages]);

  const sortBy = toSortOption(searchParams?.get('sort') ?? null);

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('sort', sort);
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return (
    <div className={styles.searchPage}>
      <PackageList
        packages={displayPackages}
        cataloguePackages={filteredPackages}
        closeMatches={closeMatches}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        featuredSlotsEnabled={featuredSlotsEnabled}
        operators={operators}
        airportOptions={airportOptions}
        initialCompareIds={initialCompareIds}
      />
    </div>
  );
}
