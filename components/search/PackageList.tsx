'use client'

import React, { useState, useEffect } from 'react';
import type { Package as CataloguePackage } from '@/lib/types';
import { Package } from '@/lib/mock-packages';
import PackageCard from './PackageCard';
import { FilterOverlay, FilterState } from './FilterOverlay';
import styles from './packages.module.css';

const SHORTLIST_STORAGE_KEY = 'kb_shortlist_packages';
const uniqueIds = (ids: string[]) => Array.from(new Set(ids));

export type SearchPackageDisplay = Package & { slug?: string };

interface PackageListProps {
  packages: SearchPackageDisplay[];
  cataloguePackages?: CataloguePackage[];
  onFilter?: () => void;
  onSort?: () => void;
}

const PackageList: React.FC<PackageListProps> = ({
  packages,
  cataloguePackages,
  onFilter,
  onSort,
}) => {
  const [shortlistedPackages, setShortlistedPackages] = useState<string[]>([]);
  const [shortlistLoaded, setShortlistLoaded] = useState(false);
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);

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

  const handleAddToShortlist = (packageId: string) => {
    setShortlistedPackages((prev) => uniqueIds(prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId]));
  };

  const handleAddToCompare = (packageId: string) => {
    void packageId;
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
  const listPackages = shortlistOnly ? packages.filter((p) => shortlistedPackages.includes(p.id)) : packages;

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
          <button className={styles.sortButton} onClick={onSort} aria-label="Sort packages">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            Sort
          </button>
          <label className={styles.shortlistFilterLabel}>
            <input
              type="checkbox"
              checked={shortlistOnly}
              onChange={(e) => setShortlistOnly(e.target.checked)}
              aria-label="Show shortlist only"
            />
            Shortlist only
          </label>
          <div className={styles.shortlistCount} aria-live="polite" aria-label={`${shortlistCount} packages in shortlist`}>
            {shortlistCount} in shortlist
          </div>
        </div>
      </header>
      <section className={styles.packageList} aria-label="Search results">
        {listPackages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            isShortlisted={shortlistedPackages.includes(pkg.id)}
            onAddToShortlist={handleAddToShortlist}
            onAddToCompare={handleAddToCompare}
          />
        ))}
      </section>

      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        initialFilters={appliedFilters || undefined}
      />
    </div>
  );
};

export default PackageList;
