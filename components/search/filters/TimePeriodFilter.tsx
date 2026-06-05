'use client'

import React, { useState, useCallback, useMemo } from 'react';
import styles from './TimePeriodFilter.module.css';

interface TimePeriodFilterProps {
  value: {
    start: string;
    end: string;
  };
  specialOccasion: string | null;
  onChange: (timePeriod: { start: string; end: string }, specialOccasion: string | null) => void;
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

const specialOccasions = [
  { id: 'christmas', label: `Christmas: Dec ${currentYear} – Jan ${nextYear}`, start: 'Dec', end: 'Jan', season: 'school-holidays' },
  { id: 'easter', label: `Easter: Mar – Apr ${nextYear}`, start: 'Mar', end: 'Apr', season: 'school-holidays' },
  { id: 'ramadan', label: `Ramadan: May – Jun ${nextYear}`, start: 'May', end: 'Jun', season: 'ramadan' },
  { id: 'summer', label: `Summer: Jul – Sep ${nextYear}`, start: 'Jul', end: 'Sep', season: 'flexible' }
];

export const TimePeriodFilter: React.FC<TimePeriodFilterProps> = ({
  value,
  specialOccasion,
  onChange
}) => {
  const [isCustomRange, setIsCustomRange] = useState(!specialOccasion);

  const startIndex = months.indexOf(value.start);
  const endIndex = months.indexOf(value.end);
  const minIndex = Math.min(startIndex, endIndex);
  const maxIndex = Math.max(startIndex, endIndex);
  const leftPercent = (minIndex / 11) * 100;
  const widthPercent = ((maxIndex - minIndex) / 11) * 100;

  const getYearLabel = useCallback((monthIdx: number) => {
    // If month is Jan–May, assume next year; Jun–Dec assume current year
    return monthIdx <= 4 ? nextYear : currentYear;
  }, []);

  const formatRange = useMemo(() => {
    const startY = getYearLabel(startIndex);
    const endY = getYearLabel(endIndex);
    if (startY === endY) {
      return `${value.start} – ${value.end} ${startY}`;
    }
    return `${value.start} ${startY} – ${value.end} ${endY}`;
  }, [startIndex, endIndex, value.start, value.end, getYearLabel]);

  const handleSpecialOccasionSelect = useCallback((occasion: typeof specialOccasions[0]) => {
    onChange({ start: occasion.start, end: occasion.end }, occasion.id);
    setIsCustomRange(false);
  }, [onChange]);

  const handleCustomRangeChange = useCallback((type: 'start' | 'end', month: string) => {
    const newValue = { ...value, [type]: month };
    onChange(newValue, null);
    setIsCustomRange(true);
  }, [value, onChange]);

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Travel Period</h3>
      
      <div className={styles.selectedPeriod} aria-live="polite">
        {isCustomRange ? formatRange : specialOccasions.find(occ => occ.id === specialOccasion)?.label ?? formatRange}
      </div>

      <div className={styles.rangeSlider}>
        <div className={styles.trackWrapper}>
          <div className={styles.track} />
          <div 
            className={styles.activeTrack}
            style={{
              left: `${leftPercent}%`,
              width: `${widthPercent}%`
            }}
          />
          <input
            type="range"
            min="0"
            max="11"
            value={startIndex}
            onChange={(e) => handleCustomRangeChange('start', months[parseInt(e.target.value)])}
            className={styles.rangeInput}
            aria-label="Start month"
            data-testid="time-start-slider"
          />
          <input
            type="range"
            min="0"
            max="11"
            value={endIndex}
            onChange={(e) => handleCustomRangeChange('end', months[parseInt(e.target.value)])}
            className={styles.rangeInput}
            aria-label="End month"
            data-testid="time-end-slider"
          />
        </div>
      </div>

      <div className={styles.specialOccasions}>
        <h4 className={styles.subLabel}>Quick Select</h4>
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
              data-testid={`time-quick-${occasion.id}`}
            >
              {occasion.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};