'use client'

import React, { useState, useMemo } from 'react';
import { Package } from '@/lib/mock-packages';
import PackageCard from './PackageCard';
import { FilterOverlay, FilterState } from './FilterOverlay';
import SortDropdown from './SortDropdown';
import { SortOption, sortPackages } from '@/lib/sort-types';
import { CompareState, isCompareEnabled, getCompareButtonText, getCompareAriaLabel, isCompareDisabled } from '@/lib/compare-types';
import { getBasketCountText, getBasketCountAriaLabel } from '@/lib/basket-types';
import styles from './packages.module.css';

interface PackageListProps {
  packages: Package[];
  onFilter?: () => void;
  onSort?: () => void;
}

const PackageList: React.FC<PackageListProps> = ({ 
  packages, 
  onSort 
}) => {
  const [shortlistCount, setShortlistCount] = useState(0);
  const [shortlistedPackages, setShortlistedPackages] = useState<Set<string>>(new Set());
  const [basketCount, setBasketCount] = useState(0);
  const [basketedPackages, setBasketedPackages] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('recommended');

  // Sort packages based on current sort option
  const sortedPackages = useMemo(() => {
    return sortPackages(packages, sortOption);
  }, [packages, sortOption]);

  // Calculate compare state
  const compareEnabled = useMemo(() => {
    return isCompareEnabled(shortlistCount);
  }, [shortlistCount]);

  const handleAddToShortlist = (packageId: string) => {
    setShortlistedPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        // Remove from shortlist
        newSet.delete(packageId);
        setShortlistCount(prevCount => prevCount - 1);
        console.log(`Removed package ${packageId} from shortlist`);
      } else {
        // Add to shortlist
        newSet.add(packageId);
        setShortlistCount(prevCount => prevCount + 1);
        console.log(`Added package ${packageId} to shortlist`);
      }
      return newSet;
    });
  };

  const handleAddToCompare = (packageId: string) => {
    if (compareEnabled) {
      console.log(`Added package ${packageId} to compare`);
      // Here you would implement the actual compare functionality
      // For now, we'll just log the action
    } else {
      console.log('Compare requires at least 2 packages in shortlist');
    }
  };

  const handleAddToBasket = (packageId: string) => {
    setBasketedPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        // Remove from basket
        newSet.delete(packageId);
        setBasketCount(prevCount => prevCount - 1);
        console.log(`Removed package ${packageId} from basket`);
      } else {
        // Add to basket
        newSet.add(packageId);
        setBasketCount(prevCount => prevCount + 1);
        console.log(`Added package ${packageId} to basket`);
      }
      return newSet;
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
    console.log('Applied filters:', filters);
    // Here you would typically filter the packages based on the applied filters
  };

  const handleFilterReset = () => {
    setAppliedFilters(null);
    console.log('Reset filters');
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    console.log('Sort changed to:', option);
  };

  return (
    <div className={styles.searchContainer}>
      {/* Top Info Bar */}
      <header className={styles.searchHeader}>
        <div className={styles.searchResults}>
          Found {sortedPackages.length} amazing packages for your journey
        </div>
        
        <div className={styles.searchControls}>
          <button 
            className={styles.filterButton}
            onClick={handleFilterClick}
            aria-label="Filter packages"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              aria-hidden="true"
            >
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
            </svg>
            Filter
          </button>
          
          <SortDropdown
            value={sortOption}
            onChange={handleSortChange}
            ariaLabel="Sort packages"
          />
          
          <div className={styles.statusContainer}>
            <div 
              className={styles.shortlistCount}
              aria-live="polite"
              aria-label={getBasketCountAriaLabel(shortlistCount)}
            >
              {shortlistCount === 0 && "No packages in shortlist"}
              {shortlistCount === 1 && "1 package in shortlist"}
              {shortlistCount > 1 && `${shortlistCount} packages in shortlist`}
              {compareEnabled && (
                <span className={styles.compareHint}>
                  • Compare enabled
                </span>
              )}
            </div>
            
            <div 
              className={styles.basketCount}
              aria-live="polite"
              aria-label={getBasketCountAriaLabel(basketCount)}
            >
              {getBasketCountText(basketCount)}
            </div>
          </div>
        </div>
      </header>

      {/* Package Cards List */}
      <section 
        className={styles.packageList}
        aria-label="Search results"
      >
        {sortedPackages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            onAddToShortlist={handleAddToShortlist}
            onAddToCompare={handleAddToCompare}
            onAddToBasket={handleAddToBasket}
            isInShortlist={shortlistedPackages.has(pkg.id)}
            isInBasket={basketedPackages.has(pkg.id)}
            compareEnabled={compareEnabled}
            shortlistCount={shortlistCount}
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
