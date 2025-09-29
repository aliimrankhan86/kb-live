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
  const [comparedPackages, setComparedPackages] = useState<Set<string>>(new Set());
  
  // Calculate compare count from the set size
  const compareCount = comparedPackages.size;
  
  // Debug logging
  console.log('Compare count:', compareCount, 'Compared packages:', Array.from(comparedPackages));
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
    setComparedPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        // Remove from compare
        newSet.delete(packageId);
        console.log(`Removed package ${packageId} from compare`);
      } else {
        // Check if we've reached the maximum limit of 3 packages
        if (newSet.size >= 3) {
          console.log('Maximum of 3 packages can be compared');
          return newSet; // Don't add more packages
        }
        // Add to compare
        newSet.add(packageId);
        console.log(`Added package ${packageId} to compare`);
      }
      return newSet;
    });
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

  // Reset compare state (for debugging)
  const resetCompareState = () => {
    setComparedPackages(new Set());
    console.log('Compare state reset');
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
          
          {/* Debug reset button */}
          <button 
            className={styles.resetButton}
            onClick={resetCompareState}
            aria-label="Reset comparison selection"
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            Reset Comparison
          </button>
          
          <div className={styles.statusContainer}>
            <div 
              className={styles.shortlistCount}
              aria-live="polite"
              aria-label={`${compareCount} packages selected for compare`}
            >
              {compareCount === 0 && "No packages selected for compare"}
              {compareCount === 1 && "1 package selected for compare"}
              {compareCount > 1 && `${compareCount} packages selected for compare`}
              {compareCount >= 3 && (
                <span className={styles.compareHint}>
                  • Max 3 packages
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
            isInCompare={comparedPackages.has(pkg.id)}
            compareEnabled={compareEnabled}
            shortlistCount={shortlistCount}
            compareCount={compareCount}
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
