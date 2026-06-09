'use client'

import React, { useState, useCallback } from 'react';
import { TimePeriodFilter } from './filters/TimePeriodFilter';
import { BudgetFilter } from './filters/BudgetFilter';
import { FlightTypeFilter } from './filters/FlightTypeFilter';
import { HotelRatingsFilter } from './filters/HotelRatingsFilter';
import { DistanceFilter } from './filters/DistanceFilter';
import {
  Dialog,
  OverlayBody,
  OverlayContent,
  OverlayDescription,
  OverlayFooter,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay';

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

  const activeFilterCount = [
    filters.specialOccasion !== null,
    filters.budget.min !== defaultFilters.budget.min || filters.budget.max !== defaultFilters.budget.max,
    filters.flightType.direct !== defaultFilters.flightType.direct || filters.flightType.stopover !== defaultFilters.flightType.stopover,
    filters.hotelRatings !== defaultFilters.hotelRatings,
    filters.distance.min !== defaultFilters.distance.min || filters.distance.max !== defaultFilters.distance.max
  ].filter(Boolean).length;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <OverlayContent
        className="max-h-[min(92dvh,56rem)] w-[min(calc(100vw-1rem),56rem)] sm:w-[min(calc(100vw-2rem),56rem)]"
        data-testid="filter-overlay"
      >
        <OverlayHeader closeButtonTestId="filter-close-btn">
          <div className="flex flex-wrap items-center gap-3">
            <OverlayTitle>Filter Packages</OverlayTitle>
            {activeFilterCount > 0 ? (
              <span
                className="rounded-md border border-[rgba(255,211,29,0.35)] bg-[rgba(255,211,29,0.08)] px-2.5 py-1 text-xs font-semibold text-[var(--yellow)]"
                aria-live="polite"
              >
                {activeFilterCount} active
              </span>
            ) : null}
          </div>
          <OverlayDescription>
            Refine packages by dates, budget, flights, hotels, and distance.
          </OverlayDescription>
        </OverlayHeader>

        <OverlayBody className="space-y-6 px-5 py-5 sm:px-6">
          <section className="border-b border-[var(--borderSubtle)] pb-6">
            <TimePeriodFilter
              value={filters.timePeriod}
              specialOccasion={filters.specialOccasion}
              onChange={(timePeriod, specialOccasion) => {
                handleFilterChange('timePeriod', timePeriod);
                handleFilterChange('specialOccasion', specialOccasion);
              }}
            />
          </section>

          <section className="border-b border-[var(--borderSubtle)] pb-6">
            <BudgetFilter
              value={filters.budget}
              onChange={(budget) => handleFilterChange('budget', budget)}
            />
          </section>

          <section className="border-b border-[var(--borderSubtle)] pb-6">
            <FlightTypeFilter
              value={filters.flightType}
              onChange={(flightType) => handleFilterChange('flightType', flightType)}
            />
          </section>

          <section className="border-b border-[var(--borderSubtle)] pb-6">
            <HotelRatingsFilter
              value={filters.hotelRatings}
              onChange={(rating) => handleFilterChange('hotelRatings', rating)}
            />
          </section>

          <section>
            <DistanceFilter
              value={filters.distance}
              onChange={(distance) => handleFilterChange('distance', distance)}
            />
          </section>
        </OverlayBody>

        <OverlayFooter className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:justify-stretch">
          <button
            onClick={handleReset}
            className="min-h-11 rounded-md border border-[var(--borderStrong)] bg-transparent px-5 py-3 text-base font-semibold text-[var(--text)] transition-colors hover:border-[var(--yellow)] hover:bg-[rgba(255,211,29,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focusRing)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surfaceDark)]"
            type="button"
            data-testid="filter-reset-btn"
          >
            Reset Filters
          </button>
          <button
            onClick={handleApply}
            className="min-h-11 rounded-md bg-[var(--yellow)] px-5 py-3 text-base font-semibold text-black transition-colors hover:bg-[#ffe36b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focusRing)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surfaceDark)]"
            type="button"
            data-testid="filter-apply-btn"
          >
            Apply Filters
          </button>
        </OverlayFooter>
      </OverlayContent>
    </Dialog>
  );
};
