'use client'

import React, { useState } from 'react';
import { Package } from '@/lib/mock-packages';
import PackageCard from './PackageCard';
import { FilterOverlay, FilterState } from './FilterOverlay';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);

  const handleAddToShortlist = (packageId: string) => {
    // Placeholder for shortlist functionality
    setShortlistCount(prev => prev + 1);
    console.log(`Added package ${packageId} to shortlist`);
  };

  const handleAddToCompare = (packageId: string) => {
    // Placeholder for compare functionality
    console.log(`Added package ${packageId} to compare`);
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

  return (
    <div className={styles.searchContainer}>
      {/* Top Info Bar */}
      <header className={styles.searchHeader}>
        <div className={styles.searchResults}>
          Found {packages.length} amazing packages for your journey
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
          
          <button 
            className={styles.sortButton}
            onClick={onSort}
            aria-label="Sort packages"
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
              <path d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            Sort
          </button>
          
          <div 
            className={styles.shortlistCount}
            aria-live="polite"
            aria-label={`${shortlistCount} packages in shortlist`}
          >
            {shortlistCount} in shortlist
          </div>
        </div>
      </header>

      {/* Package Cards List */}
      <section 
        className={styles.packageList}
        aria-label="Search results"
      >
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
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
