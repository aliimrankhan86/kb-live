'use client'



import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Package as CataloguePackage, OperatorProfile } from '@/lib/types';
import { Package } from '@/lib/mock-packages';
import { MockDB } from '@/lib/api/mock-db';
import { mapPackageToComparison, handleComparisonSelection } from '@/lib/comparison';
import { ComparisonTable } from '@/components/request/ComparisonTable';
import { Dialog, OverlayContent, OverlayHeader, OverlayTitle } from '@/components/ui/Overlay';
import PackageCard from './PackageCard';
import { FilterOverlay, FilterState } from './FilterOverlay';
import SortDropdown from './SortDropdown';
import styles from './packages.module.css';

const SHORTLIST_STORAGE_KEY = 'kb_shortlist_packages';
const uniqueIds = (ids: string[]) => Array.from(new Set(ids));

export type SearchPackageDisplay = Package & { slug?: string };

type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'distance';

interface PackageListProps {
  packages: SearchPackageDisplay[];
  cataloguePackages?: CataloguePackage[];
  onFilter?: () => void;
}

const PackageList: React.FC<PackageListProps> = ({
  packages,
  cataloguePackages,
  onFilter,
}) => {


  const [shortlistedPackages, setShortlistedPackages] = useState<string[]>([]);
  const [shortlistLoaded, setShortlistLoaded] = useState(false);
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [compareMessage, setCompareMessage] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [operatorsById, setOperatorsById] = useState<Record<string, OperatorProfile>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
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
    const ops = MockDB.getOperators();
    setOperatorsById(ops.reduce<Record<string, OperatorProfile>>((acc, op) => ({ ...acc, [op.id]: op }), {}));
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

  const handleFilterApply = (filters: FilterState) => {
    setAppliedFilters(filters);
    // Here you would typically filter the packages based on the applied filters
    onFilter?.();
  };

  const handleFilterReset = () => {
    setAppliedFilters(null);
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
  const compareDisabled = selectedCompareIds.length < 2;
  const comparisonRows = useMemo(() => {
    if (!cataloguePackages?.length) return [];
    return cataloguePackages
      .filter((p) => selectedCompareIds.includes(p.id))
      .map((p) => mapPackageToComparison(p, operatorsById[p.operatorId]));
  }, [cataloguePackages, operatorsById, selectedCompareIds]);

  return (
    <div className={styles.searchContainer}>
      <header className={styles.searchHeader}>
        <div className={styles.searchResults}>
          Found {listPackages.length} amazing packages for your journey
        </div>
        <div className={styles.searchControls}>
          <button
            className={styles.filterButton}
            onClick={handleFilterClick}
            aria-label="Filter packages"
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
                  { value: 'rating' as SortOption, label: 'Rating' },
                  { value: 'distance' as SortOption, label: 'Distance to Haram' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={sortBy === opt.value}
                    className={`${styles.sortOption} ${sortBy === opt.value ? styles.sortOptionActive : ''}`}
                    onClick={() => {
                      setSortBy(opt.value);
                      setIsSortOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <label className={styles.shortlistFilterLabel}>
            <input
              type="checkbox"
              checked={shortlistOnly}
              onChange={(e) => setShortlistOnly(e.target.checked)}
              aria-label="Show shortlist only"
            />
            Shortlist only
          </label>
          <div
            className={styles.shortlistCount}
            data-testid="search-shortlist-count"
            aria-live="polite"
            aria-label={`${shortlistCount} packages in shortlist`}
          >
            {shortlistCount} in shortlist
          </div>
          <button
            type="button"
            data-testid="search-compare-button"
            className={styles.compareButton}
            onClick={() => {
              if (selectedCompareIds.length >= 2) setShowComparison(true);
            }}
            disabled={compareDisabled}
            aria-disabled={compareDisabled}
            aria-describedby={compareDisabled ? 'search-compare-help' : undefined}
          >
            Compare ({selectedCompareIds.length})
          </button>
        </div>
      </header>
      {compareDisabled && (
        <p id="search-compare-help" className={styles.compareHelpText}>
          Select at least 2 packages to compare
        </p>
      )}
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
            onClick={handleFilterReset}
            aria-label="Reset all filters"
          >
            Reset Filters
          </button>
        </div>
      )}

      <section className={styles.packageList} aria-label="Search results">
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
              operator={operator}
              inclusions={inclusions}
              nightsMakkah={catPkg?.nightsMakkah}
              nightsMadinah={catPkg?.nightsMadinah}
              priceType={catPkg?.priceType === 'from' ? 'from' : 'exact'}
            />
          );
        })}
      </section>

      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        initialFilters={appliedFilters || undefined}
      />
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <OverlayContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <OverlayHeader>
            <OverlayTitle>Compare Packages</OverlayTitle>
          </OverlayHeader>
          <div className={`mt-4 ${styles.comparisonModalBody}`}>
            <ComparisonTable rows={comparisonRows} />
          </div>
        </OverlayContent>
      </Dialog>
    </div>
  );
};

export default PackageList;
