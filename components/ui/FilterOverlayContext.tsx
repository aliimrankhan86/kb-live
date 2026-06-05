'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import { FilterState } from './FilterOverlay';

// Context interface for filter overlay state and actions
interface FilterOverlayContextValue {
  /** Current filter state */
  filters: FilterState;
  /** Function to update a specific filter */
  onFilterChange: (filterType: keyof FilterState, value: FilterState[keyof FilterState]) => void;
  /** Function to apply filters */
  onApply: () => void;
  /** Function to reset filters */
  onReset: () => void;
  /** Function to close overlay */
  onClose: () => void;
  /** Whether overlay is currently animating */
  isAnimating: boolean;
  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean;
}

// Create context with default values
const FilterOverlayContext = createContext<FilterOverlayContextValue | null>(null);

// Provider component
interface FilterOverlayProviderProps {
  children: ReactNode;
  value: FilterOverlayContextValue;
}

export const FilterOverlayProvider: React.FC<FilterOverlayProviderProps> = ({
  children,
  value
}) => {
  return (
    <FilterOverlayContext.Provider value={value}>
      {children}
    </FilterOverlayContext.Provider>
  );
};

// Hook to use filter overlay context
export const useFilterOverlay = (): FilterOverlayContextValue => {
  const context = useContext(FilterOverlayContext);
  
  if (!context) {
    throw new Error('useFilterOverlay must be used within a FilterOverlayProvider');
  }
  
  return context;
};

// Hook for individual filter components
export const useFilter = <T extends keyof FilterState>(
  filterType: T
): [FilterState[T], (value: FilterState[T]) => void] => {
  const { filters, onFilterChange } = useFilterOverlay();
  
  const value = filters[filterType];
  const setValue = (newValue: FilterState[T]) => {
    onFilterChange(filterType, newValue);
  };
  
  return [value, setValue];
};
