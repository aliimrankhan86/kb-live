'use client'

import React, { useState } from 'react';
import { TimePeriodFilter } from './filters/TimePeriodFilter';
import { BudgetFilter } from './filters/BudgetFilter';
import { FlightTypeFilter } from './filters/FlightTypeFilter';
import { HotelRatingsFilter } from './filters/HotelRatingsFilter';
import { DistanceFilter } from './filters/DistanceFilter';
import { Button } from '@/components/ui/Button';
import { Dialog, OverlayContent, OverlayFooter, OverlayHeader, OverlayTitle } from '@/components/ui/Overlay';
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <OverlayContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <OverlayHeader className={styles.header}>
          <OverlayTitle id="filter-title" className={styles.title}>
            Filter Packages
          </OverlayTitle>
        </OverlayHeader>

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

        <OverlayFooter className={styles.footer}>
          <Button
            onClick={handleReset}
            className={styles.resetButton}
            type="button"
            variant="secondary"
          >
            Reset Filters
          </Button>
          <Button
            onClick={handleApply}
            className={styles.applyButton}
            type="button"
            variant="primary"
          >
            Apply Filters
          </Button>
        </OverlayFooter>
      </OverlayContent>
    </Dialog>
  );
};
