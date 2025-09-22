'use client'

import React, { useState, useEffect, useRef } from 'react';
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

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (isMountedRef.current && overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    try {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.warn('Error setting up filter overlay:', error);
    }

    return () => {
      if (isMountedRef.current) {
        try {
          document.removeEventListener('mousedown', handleClickOutside);
          document.body.style.overflow = 'unset';
        } catch (error) {
          console.warn('Error cleaning up filter overlay:', error);
        }
      }
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

    try {
      document.addEventListener('keydown', handleEscape);
    } catch (error) {
      console.warn('Error setting up escape handler:', error);
    }

    return () => {
      if (isMountedRef.current) {
        try {
          document.removeEventListener('keydown', handleEscape);
        } catch (error) {
          console.warn('Error cleaning up escape handler:', error);
        }
      }
    };
  }, [isOpen, onClose]);

  const handleFilterChange = (filterType: keyof FilterState, value: FilterState[keyof FilterState]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onReset();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="filter-title">
      <div 
        ref={overlayRef}
        className={styles.overlay}
        role="document"
      >
        <div className={styles.header}>
          <h2 id="filter-title" className={styles.title}>Filter Packages</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close filter overlay"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
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

        <div className={styles.footer}>
          <button
            onClick={handleReset}
            className={styles.resetButton}
            type="button"
          >
            Reset Filters
          </button>
          <button
            onClick={handleApply}
            className={styles.applyButton}
            type="button"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
