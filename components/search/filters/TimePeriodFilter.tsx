'use client'

import React, { useState } from 'react';
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

const specialOccasions = [
  { id: 'christmas', label: 'Christmas: Dec - Jan', start: 'Dec', end: 'Jan' },
  { id: 'easter', label: 'Easter: Mar - Apr', start: 'Mar', end: 'Apr' },
  { id: 'ramadan', label: 'Ramadan: May - Jun', start: 'May', end: 'Jun' },
  { id: 'summer', label: 'Summer: Jul - Sep', start: 'Jul', end: 'Sep' }
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

  const handleSpecialOccasionSelect = (occasion: typeof specialOccasions[0]) => {
    onChange({ start: occasion.start, end: occasion.end }, occasion.id);
    setIsCustomRange(false);
  };

  const handleCustomRangeChange = (type: 'start' | 'end', month: string) => {
    const newValue = { ...value, [type]: month };
    onChange(newValue, null);
    setIsCustomRange(true);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Time Period:</h3>
      
      {!isCustomRange && specialOccasion && (
        <div className={styles.selectedPeriod}>
          {specialOccasions.find(occ => occ.id === specialOccasion)?.label}
        </div>
      )}
      
      {isCustomRange && (
        <div className={styles.selectedPeriod}>
          {value.start} - {value.end} 2020
        </div>
      )}

      <div className={styles.rangeSlider}>
        <div className={styles.track}>
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
          />
          <input
            type="range"
            min="0"
            max="11"
            value={endIndex}
            onChange={(e) => handleCustomRangeChange('end', months[parseInt(e.target.value)])}
            className={styles.rangeInput}
            aria-label="End month"
          />
        </div>
      </div>

      <div className={styles.specialOccasions}>
        <h4 className={styles.subLabel}>Or Select One:</h4>
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
            >
              {occasion.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
