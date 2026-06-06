'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimePeriodFilter } from './filters/TimePeriodFilter';
import { BudgetFilter } from './filters/BudgetFilter';
import { FlightTypeFilter } from './filters/FlightTypeFilter';
import { HotelRatingsFilter } from './filters/HotelRatingsFilter';
import { DistanceFilter } from './filters/DistanceFilter';
import styles from './FilterOverlay.module.css';

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

interface FilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  initialFilters?: Partial<FilterState>;
}

const defaultFilters: FilterState = {
  timePeriod: {
    start: 'Jan',
    end: 'May'
  },
  specialOccasion: null,
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

export const FilterOverlay: React.FC<FilterOverlayProps> = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters
  });
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (isMountedRef.current && overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (isMountedRef.current && event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const focusableElements = overlay.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    overlay.addEventListener('keydown', handleTab);
    return () => overlay.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleFilterChange = useCallback((filterType: keyof FilterState, value: FilterState[keyof FilterState]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleApply = useCallback(() => {
    onApply(filters);
    onClose();
  }, [filters, onApply, onClose]);

  const handleReset = useCallback(() => {
    setFilters(defaultFilters);
    onReset();
  }, [onReset]);

  if (!isOpen) return null;

  const activeFilterCount = [
    filters.specialOccasion !== null,
    filters.budget.min !== defaultFilters.budget.min || filters.budget.max !== defaultFilters.budget.max,
    filters.flightType.direct !== defaultFilters.flightType.direct || filters.flightType.stopover !== defaultFilters.flightType.stopover,
    filters.hotelRatings !== defaultFilters.hotelRatings,
    filters.distance.min !== defaultFilters.distance.min || filters.distance.max !== defaultFilters.distance.max
  ].filter(Boolean).length;

  return (
    <div 
      className={styles.backdrop} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="filter-title"
      data-testid="filter-overlay"
    >
      <div 
        ref={overlayRef}
        className={styles.overlay}
        role="document"
      >
        <div className={styles.header}>
          <div className={styles.headerTitleRow}>
            <h2 id="filter-title" className={styles.title}>Filter Packages</h2>
            {activeFilterCount > 0 && (
              <span className={styles.activeCount} aria-live="polite">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close filter overlay"
            data-testid="filter-close-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          <section className={styles.filterSection}>
            <TimePeriodFilter
              value={filters.timePeriod}
              specialOccasion={filters.specialOccasion}
              onChange={(timePeriod, specialOccasion) => {
                handleFilterChange('timePeriod', timePeriod);
                handleFilterChange('specialOccasion', specialOccasion);
              }}
            />
          </section>

          <section className={styles.filterSection}>
            <BudgetFilter
              value={filters.budget}
              onChange={(budget) => handleFilterChange('budget', budget)}
            />
          </section>

          <section className={styles.filterSection}>
            <FlightTypeFilter
              value={filters.flightType}
              onChange={(flightType) => handleFilterChange('flightType', flightType)}
            />
          </section>

          <section className={styles.filterSection}>
            <HotelRatingsFilter
              value={filters.hotelRatings}
              onChange={(rating) => handleFilterChange('hotelRatings', rating)}
            />
          </section>

          <section className={styles.filterSection}>
            <DistanceFilter
              value={filters.distance}
              onChange={(distance) => handleFilterChange('distance', distance)}
            />
          </section>
        </div>

        <div className={styles.footer}>
          <button
            onClick={handleReset}
            className={styles.resetButton}
            type="button"
            data-testid="filter-reset-btn"
          >
            Reset Filters
          </button>
          <button
            onClick={handleApply}
            className={styles.applyButton}
            type="button"
            data-testid="filter-apply-btn"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};