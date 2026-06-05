'use client'

import React, { useCallback } from 'react';
import { useFilter } from '../FilterOverlayContext';
import styles from './EnhancedTimePeriodFilter.module.css';

interface SpecialOccasion {
  id: string;
  label: string;
  start: string;
  end: string;
  description?: string;
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const specialOccasions: SpecialOccasion[] = [
  { 
    id: 'christmas', 
    label: 'Christmas', 
    start: 'Dec', 
    end: 'Jan',
    description: 'Dec - Jan 2025'
  },
  { 
    id: 'easter', 
    label: 'Easter', 
    start: 'Mar', 
    end: 'Apr',
    description: 'Mar - Apr 2025'
  },
  { 
    id: 'ramadan', 
    label: 'Ramadan', 
    start: 'May', 
    end: 'Jun',
    description: 'May - Jun 2025'
  },
  { 
    id: 'summer', 
    label: 'Summer', 
    start: 'Jul', 
    end: 'Sep',
    description: 'Jul - Sep 2025'
  }
];

export const EnhancedTimePeriodFilter: React.FC = () => {
  const [timePeriod, setTimePeriod] = useFilter('timePeriod');
  const [specialOccasion, setSpecialOccasion] = useFilter('specialOccasion');
  // Track if user is using custom range vs predefined occasions (for future use)
  // const [isCustomRange] = useState(!specialOccasion);

  const handleSpecialOccasionSelect = useCallback((occasion: SpecialOccasion) => {
    setTimePeriod({ start: occasion.start, end: occasion.end });
    setSpecialOccasion(occasion.id);
    // setIsCustomRange(false); // Not needed as we're not using setter
  }, [setTimePeriod, setSpecialOccasion]);

  const handleCustomRangeChange = useCallback((type: 'start' | 'end', month: string) => {
    const newValue = { ...timePeriod, [type]: month };
    setTimePeriod(newValue);
    setSpecialOccasion(null);
    // setIsCustomRange(true); // Not needed as we're not using setter
  }, [timePeriod, setTimePeriod, setSpecialOccasion]);

  const getSelectedOccasion = () => {
    return specialOccasions.find(occ => occ.id === specialOccasion);
  };

  const selectedOccasion = getSelectedOccasion();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.label}>Time Period</h3>
        <div className={styles.selectedDisplay}>
          {selectedOccasion ? (
            <span className={styles.selectedText}>
              {selectedOccasion.label} ({selectedOccasion.description})
            </span>
          ) : (
            <span className={styles.selectedText}>
              {timePeriod.start} - {timePeriod.end} 2025
            </span>
          )}
        </div>
      </div>

      {/* Custom Range Slider */}
      <div className={styles.customRangeSection}>
        <h4 className={styles.subLabel}>Custom Range</h4>
        <div className={styles.rangeSlider}>
          <div className={styles.track}>
            <div 
              className={styles.activeTrack}
              style={{
                left: `${(months.indexOf(timePeriod.start) / 11) * 100}%`,
                width: `${((months.indexOf(timePeriod.end) - months.indexOf(timePeriod.start) + 1) / 12) * 100}%`
              }}
            />
            <input
              type="range"
              min="0"
              max="11"
              value={months.indexOf(timePeriod.start)}
              onChange={(e) => handleCustomRangeChange('start', months[parseInt(e.target.value)])}
              className={styles.rangeInput}
              aria-label="Start month"
              aria-valuemin={0}
              aria-valuemax={11}
              aria-valuenow={months.indexOf(timePeriod.start)}
              aria-valuetext={timePeriod.start}
            />
            <input
              type="range"
              min="0"
              max="11"
              value={months.indexOf(timePeriod.end)}
              onChange={(e) => handleCustomRangeChange('end', months[parseInt(e.target.value)])}
              className={styles.rangeInput}
              aria-label="End month"
              aria-valuemin={0}
              aria-valuemax={11}
              aria-valuenow={months.indexOf(timePeriod.end)}
              aria-valuetext={timePeriod.end}
            />
          </div>
          <div className={styles.monthLabels}>
            {months.map((month, index) => (
              <span 
                key={month} 
                className={styles.monthLabel}
                style={{ left: `${(index / 11) * 100}%` }}
              >
                {month}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Special Occasions */}
      <div className={styles.specialOccasionsSection}>
        <h4 className={styles.subLabel}>Special Occasions</h4>
        <div className={styles.occasionGrid}>
          {specialOccasions.map((occasion) => (
            <button
              key={occasion.id}
              onClick={() => handleSpecialOccasionSelect(occasion)}
              className={`${styles.occasionButton} ${
                specialOccasion === occasion.id ? styles.selected : ''
              }`}
              type="button"
              aria-pressed={specialOccasion === occasion.id}
              aria-describedby={`${occasion.id}-description`}
            >
              <span className={styles.occasionLabel}>{occasion.label}</span>
              <span 
                id={`${occasion.id}-description`}
                className={styles.occasionDescription}
              >
                {occasion.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
