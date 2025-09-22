'use client'

import React, { useState } from 'react';
import { FilterOverlay, FilterState } from './FilterOverlay';
// Import your existing filter components for direct usage
import { TimePeriodFilter } from '../search/filters/TimePeriodFilter';
import { BudgetFilter } from '../search/filters/BudgetFilter';
import { FlightTypeFilter } from '../search/filters/FlightTypeFilter';
import { HotelRatingsFilter } from '../search/filters/HotelRatingsFilter';
import { DistanceFilter } from '../search/filters/DistanceFilter';

/**
 * Integration example showing how to use the new FilterOverlay
 * with your existing filter components
 */
export const FilterOverlayIntegration: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  const handleFilterClose = () => {
    setIsFilterOpen(false);
  };

  const handleFilterApply = (filters: FilterState) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
    // Here you would typically filter your data based on the applied filters
  };

  const handleFilterReset = () => {
    setAppliedFilters(null);
    console.log('Reset filters');
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={handleFilterClick}
        className="filter-trigger-button"
        aria-label="Open filter overlay"
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
        Filter Packages
      </button>

      {/* Enhanced Filter Overlay */}
      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        initialFilters={appliedFilters || undefined}
        title="Filter Packages"
        showResetButton={true}
        closeOnBackdropClick={true}
        ariaLabel="Filter packages overlay"
      >
        {/* You can customize the content by providing children */}
        <div className="custom-filter-content">
          {/* The FilterOverlay now automatically includes all existing filter components */}
          {/* with the exact same styling and behavior as your current implementation */}
          {/* No additional components needed - perfect compatibility! */}
        </div>
      </FilterOverlay>
    </>
  );
};

/**
 * Example of how to replace your existing FilterOverlay usage
 * This shows the minimal changes needed for migration
 */
export const MigrationExample: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);

  return (
    <FilterOverlay
      isOpen={isFilterOpen}
      onClose={() => setIsFilterOpen(false)}
      onApply={(filters) => {
        setAppliedFilters(filters);
        // Your existing filter application logic
      }}
      onReset={() => {
        setAppliedFilters(null);
        // Your existing reset logic
      }}
      initialFilters={appliedFilters || undefined}
      // All other props are optional and have sensible defaults
    />
  );
};

/**
 * Advanced usage example with custom styling and behavior
 */
export const AdvancedFilterOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState | null>(null);

  return (
    <FilterOverlay
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onApply={setFilters}
      onReset={() => setFilters(null)}
      initialFilters={filters || undefined}
      title="Advanced Package Filters"
      showResetButton={true}
      className="custom-filter-overlay"
      ariaLabel="Advanced package filtering options"
      closeOnBackdropClick={true}
      zIndex={1500} // Higher z-index for special cases
    />
  );
};
