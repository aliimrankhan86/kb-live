'use client'

import React, { useState } from 'react';
import { FilterOverlay, FilterState } from './FilterOverlay';
import { EnhancedTimePeriodFilter } from './filters/EnhancedTimePeriodFilter';
// Import your existing filter components
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
          {/* Use the enhanced time period filter */}
          <EnhancedTimePeriodFilter />
          
          {/* Use your existing filter components */}
          <BudgetFilter
            value={appliedFilters?.budget || { min: 1000, max: 3000 }}
            onChange={(budget) => {
              // This would be handled by the context in a real implementation
              console.log('Budget changed:', budget);
            }}
          />
          
          <FlightTypeFilter
            value={appliedFilters?.flightType || { direct: true, stopover: false }}
            onChange={(flightType) => {
              console.log('Flight type changed:', flightType);
            }}
          />
          
          <HotelRatingsFilter
            value={appliedFilters?.hotelRatings || 3}
            onChange={(rating) => {
              console.log('Hotel rating changed:', rating);
            }}
          />
          
          <DistanceFilter
            value={appliedFilters?.distance || { min: 100, max: 2000 }}
            onChange={(distance) => {
              console.log('Distance changed:', distance);
            }}
          />
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
