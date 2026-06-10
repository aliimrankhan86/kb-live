'use client'



import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { Package as CataloguePackage, OperatorProfile } from '@/lib/types';
import type { SearchPackageDisplay } from './search-utils';
import { mapPackageToComparison, handleComparisonSelection } from '@/lib/comparison';
import { ComparisonTable } from '@/components/request/ComparisonTable';
import {
  Dialog,
  OverlayBody,
  OverlayContent,
  OverlayDescription,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay';
import PackageCard from './PackageCard';
import CompareBar, { type CompareBarItem } from './CompareBar';
import { FilterOverlay } from './FilterOverlay';
import styles from './packages.module.css';

const COMPARE_MAX = 3;
const COMPARE_MIN = 2;

const SHORTLIST_STORAGE_KEY = 'kb_shortlist_packages';
const uniqueIds = (ids: string[]) => Array.from(new Set(ids));

export type { SearchPackageDisplay } from './search-utils';

type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'distance';


interface PackageListProps {
  packages: SearchPackageDisplay[];
  cataloguePackages?: CataloguePackage[];
  onFilter?: () => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

const PackageList: React.FC<PackageListProps> = ({
  packages,
  cataloguePackages,
  onFilter,
  sortBy: sortByProp,
  onSortChange,
}) => {
  const [shortlistedPackages, setShortlistedPackages] = useState<string[]>([]);
  const [shortlistLoaded, setShortlistLoaded] = useState(false);
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [compareMessage, setCompareMessage] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [operatorsById, setOperatorsById] = useState<Record<string, OperatorProfile>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [internalSort, setInternalSort] = useState<SortOption>('price-asc');
  const sortBy = sortByProp ?? internalSort;
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!isSortOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  useEffect(() => {
    fetch('/api/operators')
      .then((r) => r.json())
      .then((d) => {
        if (d.operators) {
          setOperatorsById(
            (d.operators as OperatorProfile[]).reduce<Record<string, OperatorProfile>>(
              (acc, op) => ({ ...acc, [op.id]: op }),
              {}
            )
          );
        }
      });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setShortlistedPackages(Array.isArray(parsed) ? uniqueIds(parsed) : []);
    } catch {
      setShortlistedPackages([]);
    } finally {
      setShortlistLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!shortlistLoaded || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(uniqueIds(shortlistedPackages)));
    } catch {
      /* ignore */
    }
  }, [shortlistLoaded, shortlistedPackages]);

  const onToggleShortlist = (packageId: string) => {
    setShortlistedPackages((prev) => uniqueIds(prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId]));
  };

  const onToggleCompare = (packageId: string) => {
    setCompareMessage('');
    setSelectedCompareIds((prev) => {
      try {
        return handleComparisonSelection(prev, packageId);
      } catch (err) {
        setCompareMessage((err as Error).message);
        return prev;
      }
    });
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  // Clear all filter params from the URL — results re-filter automatically.
  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    ['budgetMin', 'budgetMax', 'hotelStars', 'season', 'maxDistance', 'flightType'].forEach((k) =>
      params.delete(k)
    );
    router.replace(`${pathname}?${params.toString()}`);
    onFilter?.();
  };



  const shortlistCount = shortlistedPackages.length;

  // Sort packages
  const sortedPackages = useMemo(() => {
    const sorted = [...packages];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.makkahHotel.rating + b.madinaHotel.rating) - (a.makkahHotel.rating + a.madinaHotel.rating));
      case 'distance':
        // Prefer near hotels (simple heuristic)
        return sorted.sort((a, b) => {
          const aDist = a.makkahHotel.distance.toLowerCase().includes('near') ? 0 : 1;
          const bDist = b.makkahHotel.distance.toLowerCase().includes('near') ? 0 : 1;
          return aDist - bDist;
        });
      default:
        return sorted;
    }
  }, [packages, sortBy]);

  const listPackages = shortlistOnly
    ? sortedPackages.filter((p) => shortlistedPackages.includes(p.id))
    : sortedPackages;
  const compareFull = selectedCompareIds.length >= COMPARE_MAX;
  const comparisonRows = useMemo(() => {
    if (!cataloguePackages?.length) return [];
    return cataloguePackages
      .filter((p) => selectedCompareIds.includes(p.id))
      .map((p) => mapPackageToComparison(p, operatorsById[p.operatorId]));
  }, [cataloguePackages, operatorsById, selectedCompareIds]);

  // Labels for the sticky compare bar — operator name keeps it human.
  const compareItems = useMemo<CompareBarItem[]>(() => {
    return selectedCompareIds.map((id) => {
      const catPkg = cataloguePackages?.find((p) => p.id === id);
      const operator = catPkg ? operatorsById[catPkg.operatorId] : undefined;
      return {
        id,
        label: operator?.companyName ?? catPkg?.title ?? 'Selected package',
      };
    });
  }, [selectedCompareIds, cataloguePackages, operatorsById]);

  const openComparison = () => {
    // Defer past the current event tick so Radix DismissableLayer doesn't treat
    // this click as an "outside" click and immediately re-close the dialog.
    if (selectedCompareIds.length >= COMPARE_MIN) {
      setTimeout(() => setShowComparison(true), 0);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <header className={styles.searchHeader}>
        <div className={styles.searchHeaderTop}>
          <div className={styles.searchResults} aria-live="polite">
            <strong>{listPackages.length}</strong> {listPackages.length === 1 ? 'package' : 'packages'} found
          </div>
          <div className={styles.searchControls}>
            <button
              className={styles.filterButton}
              onClick={handleFilterClick}
              aria-label="Filter packages"
              data-testid="filter-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
              </svg>
              Filter
            </button>

            <div className={styles.sortWrapper} ref={sortRef}>
              <button
                className={styles.sortButton}
                onClick={() => setIsSortOpen(!isSortOpen)}
                aria-expanded={isSortOpen}
                aria-haspopup="listbox"
                aria-label="Sort packages"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M7 12h10M10 18h4" />
                </svg>
                Sort
              </button>
              {isSortOpen && (
                <div
                  className={styles.sortDropdown}
                  role="listbox"
                  aria-label="Sort options"
                >
                  {([
                    { value: 'price-asc' as SortOption, label: 'Price: Low to High' },
                    { value: 'price-desc' as SortOption, label: 'Price: High to Low' },
                    { value: 'rating' as SortOption, label: 'Hotel rating' },
                    { value: 'distance' as SortOption, label: 'Closest to Haram' },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      role="option"
                      aria-selected={sortBy === opt.value}
                      className={`${styles.sortOption} ${sortBy === opt.value ? styles.sortOptionActive : ''}`}
                      onClick={() => {
                        if (onSortChange) {
                          onSortChange(opt.value);
                        } else {
                          setInternalSort(opt.value);
                        }
                        setIsSortOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {shortlistCount > 0 && (
          <button
            type="button"
            className={`${styles.savedChip} ${shortlistOnly ? styles.savedChipActive : ''}`}
            onClick={() => setShortlistOnly((v) => !v)}
            aria-pressed={shortlistOnly}
            data-testid="search-shortlist-count"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={shortlistOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {shortlistOnly ? `Showing ${shortlistCount} saved` : `Saved (${shortlistCount})`}
          </button>
        )}
      </header>
      {compareMessage ? (
        <p role="status" data-testid="search-compare-message" className={styles.compareMessageText}>
          {compareMessage}
        </p>
      ) : null}


      {listPackages.length === 0 && (
        <div className={styles.emptyState} role="status" aria-live="polite">
          <div className={styles.emptyStateIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </div>
          <h2 className={styles.emptyStateTitle}>No packages match your filters</h2>
          <p className={styles.emptyStateText}>
            Try adjusting your budget range, dates, or removing some filters to see more results.
          </p>
          <button
            className={styles.emptyStateAction}
            onClick={handleClearFilters}
            aria-label="Reset all filters"
          >
            Reset filters
          </button>
        </div>
      )}

      <section
        className={`${styles.packageList} ${compareItems.length > 0 ? styles.packageListWithBar : ''}`}
        aria-label="Search results"
      >
        {listPackages.map((pkg) => {
          const catPkg = cataloguePackages?.find((cp) => cp.id === pkg.id);
          const operator = catPkg ? operatorsById[catPkg.operatorId] : undefined;
          const inclusions = catPkg ? [
            { label: 'Visa', included: catPkg.inclusions?.visa ?? false },
            { label: 'Flights', included: catPkg.inclusions?.flights ?? false },
            { label: 'Transfers', included: catPkg.inclusions?.transfers ?? false },
            { label: 'Meals', included: catPkg.inclusions?.meals ?? false },
          ].filter((chip) => chip.included) : undefined;

          return (
            <PackageCard
              key={pkg.id}
              package={pkg}
              isShortlisted={shortlistedPackages.includes(pkg.id)}
              isCompareSelected={selectedCompareIds.includes(pkg.id)}
              onAddToShortlist={onToggleShortlist}
              onToggleCompare={onToggleCompare}
              compareFull={compareFull}
              operator={operator}
              inclusions={inclusions}
              nightsMakkah={catPkg?.nightsMakkah}
              nightsMadinah={catPkg?.nightsMadinah}
              priceType={catPkg?.priceType === 'from' ? 'from' : 'exact'}
            />
          );
        })}
      </section>

      <CompareBar
        items={compareItems}
        min={COMPARE_MIN}
        max={COMPARE_MAX}
        onRemove={onToggleCompare}
        onClear={() => { setSelectedCompareIds([]); setCompareMessage(''); }}
        onCompare={openComparison}
      />

      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={handleFilterClose}
      />
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <OverlayContent className="max-h-[min(92dvh,56rem)] w-[min(calc(100vw-1rem),68rem)] sm:w-[min(calc(100vw-2rem),68rem)]">
          <OverlayHeader closeButtonTestId="comparison-close-btn">
            <OverlayTitle>Compare Packages</OverlayTitle>
            <OverlayDescription>
              Review selected packages side by side across price, operator, hotels, and inclusions.
            </OverlayDescription>
          </OverlayHeader>
          <OverlayBody className="p-0">
            <ComparisonTable rows={comparisonRows} />
          </OverlayBody>
        </OverlayContent>
      </Dialog>
    </div>
  );
};

export default PackageList;
