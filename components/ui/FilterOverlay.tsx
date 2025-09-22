'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FilterOverlayProvider } from './FilterOverlayContext';
import { FilterOverlayBackdrop } from './FilterOverlayBackdrop';
import { FilterOverlayContent } from './FilterOverlayContent';
import { FilterOverlayHeader } from './FilterOverlayHeader';
import { FilterOverlayFooter } from './FilterOverlayFooter';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useReducedMotion } from '@/hooks/useReducedMotion';
// Import existing filter components for perfect compatibility
import { TimePeriodFilter } from '../search/filters/TimePeriodFilter';
import { BudgetFilter } from '../search/filters/BudgetFilter';
import { FlightTypeFilter } from '../search/filters/FlightTypeFilter';
import { HotelRatingsFilter } from '../search/filters/HotelRatingsFilter';
import { DistanceFilter } from '../search/filters/DistanceFilter';
import styles from './FilterOverlay.module.css';

// Enhanced Filter State Interface with better type safety
export interface FilterState {
  timePeriod: {
    start: string;
    end: string;
  };
  specialOccasion: string | null;
  budget: {
    min: number;
    max: number;
  };
  flightType: {
    direct: boolean;
    stopover: boolean;
  };
  hotelRatings: number;
  distance: {
    min: number;
    max: number;
  };
}

// Enhanced Props Interface with better accessibility and customization
export interface FilterOverlayProps {
  /** Whether the overlay is currently open */
  isOpen: boolean;
  /** Callback when overlay should be closed */
  onClose: () => void;
  /** Callback when filters are applied */
  onApply: (filters: FilterState) => void;
  /** Callback when filters are reset */
  onReset: () => void;
  /** Initial filter values */
  initialFilters?: Partial<FilterState>;
  /** Custom title for the overlay */
  title?: string;
  /** Whether to show the reset button */
  showResetButton?: boolean;
  /** Custom class name for styling */
  className?: string;
  /** ARIA label for the overlay */
  ariaLabel?: string;
  /** Whether to close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Custom z-index for the overlay */
  zIndex?: number;
}

// Default filter values with better defaults
const defaultFilters: FilterState = {
  timePeriod: {
    start: 'Jan',
    end: 'May'
  },
  specialOccasion: 'Ramadan',
  budget: {
    min: 1000,
    max: 3000
  },
  flightType: {
    direct: true,
    stopover: false
  },
  hotelRatings: 3,
  distance: {
    min: 100,
    max: 2000
  }
};

// Main Filter Overlay Component
const FilterOverlayComponent: React.FC<FilterOverlayProps> = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  initialFilters = {},
  title = 'Filter Packages',
  showResetButton = true,
  className = '',
  ariaLabel = 'Filter packages overlay',
  closeOnBackdropClick = true,
  zIndex = 1000
}) => {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const isMountedRef = useRef(true);
  const prefersReducedMotion = useReducedMotion();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle escape key
  useEscapeKey(isOpen, onClose);

  // Handle click outside
  useClickOutside(overlayRef, isOpen && closeOnBackdropClick ? onClose : () => {});

  // Focus management
  useFocusTrap(overlayRef, isOpen);

  // Store previous active element and restore focus on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setIsAnimating(true);
      
      // Prevent body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        if (isMountedRef.current) {
          document.body.style.overflow = originalOverflow;
          // Restore focus to previous element
          if (previousActiveElement.current) {
            previousActiveElement.current.focus();
          }
        }
      };
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  // Handle filter changes with better type safety
  const handleFilterChange = useCallback((
    filterType: keyof FilterState, 
    value: FilterState[keyof FilterState]
  ) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Handle apply with validation
  const handleApply = useCallback(() => {
    // Validate filters before applying
    if (filters.budget.min > filters.budget.max) {
      console.warn('Invalid budget range: min > max');
      return;
    }
    
    if (filters.distance.min > filters.distance.max) {
      console.warn('Invalid distance range: min > max');
      return;
    }

    onApply(filters);
    onClose();
  }, [filters, onApply, onClose]);

  // Handle reset
  const handleReset = useCallback(() => {
    setFilters(defaultFilters);
    onReset();
  }, [onReset]);

  // Don't render if not open
  if (!isOpen) return null;

  // Create portal for proper z-index management
  const overlayContent = (
    <FilterOverlayProvider
      value={{
        filters,
        onFilterChange: handleFilterChange,
        onApply: handleApply,
        onReset: handleReset,
        onClose,
        isAnimating,
        prefersReducedMotion
      }}
    >
      <FilterOverlayBackdrop
        className={className}
        style={{ zIndex }}
        ariaLabel={ariaLabel}
      >
        <FilterOverlayContent ref={overlayRef}>
          <FilterOverlayHeader title={title} onClose={onClose} />
          
        <div className={styles.content}>
          {/* Use existing filter components for perfect compatibility */}
          <TimePeriodFilter
            value={filters.timePeriod}
            specialOccasion={filters.specialOccasion}
            onChange={(timePeriod, specialOccasion) => {
              handleFilterChange('timePeriod', timePeriod);
              handleFilterChange('specialOccasion', specialOccasion);
            }}
          />

          <BudgetFilter
            value={filters.budget}
            onChange={(budget) => handleFilterChange('budget', budget)}
          />

          <FlightTypeFilter
            value={filters.flightType}
            onChange={(flightType) => handleFilterChange('flightType', flightType)}
          />

          <HotelRatingsFilter
            value={filters.hotelRatings}
            onChange={(rating) => handleFilterChange('hotelRatings', rating)}
          />

          <DistanceFilter
            value={filters.distance}
            onChange={(distance) => handleFilterChange('distance', distance)}
          />
        </div>
          
          <FilterOverlayFooter 
            showResetButton={showResetButton}
            onApply={handleApply}
            onReset={handleReset}
          />
        </FilterOverlayContent>
      </FilterOverlayBackdrop>
    </FilterOverlayProvider>
  );

  return createPortal(overlayContent, document.body);
};

// Enhanced Filter Overlay with better error boundaries and performance
export const FilterOverlay: React.FC<FilterOverlayProps> = React.memo((props) => {
  return (
    <FilterOverlayComponent {...props} />
  );
});

FilterOverlay.displayName = 'FilterOverlay';
