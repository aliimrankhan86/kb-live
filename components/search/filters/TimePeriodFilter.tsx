import React, { useState, useCallback, useMemo } from 'react';
import { RangeSlider } from '@/components/ui/RangeSlider';
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
  { id: 'christmas', label: `Christmas: Dec ${currentYear} - Jan ${nextYear}`, start: 'Dec', end: 'Jan', season: 'school-holidays' },
  { id: 'easter', label: `Easter: Mar - Apr ${nextYear}`, start: 'Mar', end: 'Apr', season: 'school-holidays' },
  { id: 'ramadan', label: `Ramadan: May - Jun ${nextYear}`, start: 'May', end: 'Jun', season: 'ramadan' },
  { id: 'summer', label: `Summer: Jul - Sep ${nextYear}`, start: 'Jul', end: 'Sep', season: 'flexible' }
];

export const TimePeriodFilter: React.FC<TimePeriodFilterProps> = ({
  value,
  specialOccasion,
  onChange
}) => {
  const [isCustomRange, setIsCustomRange] = useState(!specialOccasion);

  const startIndex = months.indexOf(value.start);
  const endIndex = months.indexOf(value.end);

  const getYearLabel = useCallback((monthIdx: number) => {
    return monthIdx <= 4 ? nextYear : currentYear;
  }, []);

  const formatRange = useMemo(() => {
    const startY = getYearLabel(startIndex);
    const endY = getYearLabel(endIndex);
    if (startY === endY) {
      return `${value.start} - ${value.end} ${startY}`;
    }
    return `${value.start} ${startY} - ${value.end} ${endY}`;
  }, [startIndex, endIndex, value.start, value.end, getYearLabel]);

  const handleSpecialOccasionSelect = useCallback((occasion: typeof specialOccasions[0]) => {
    onChange({ start: occasion.start, end: occasion.end }, occasion.id);
    setIsCustomRange(false);
  }, [onChange]);

  const handleSliderChange = useCallback(([minIdx, maxIdx]: [number, number]) => {
    onChange(
      { start: months[minIdx], end: months[maxIdx] },
      null
    );
    setIsCustomRange(true);
  }, [onChange]);

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Travel Period</h3>
      
      <div className={styles.selectedPeriod} aria-live="polite">
        {isCustomRange ? formatRange : specialOccasions.find(occ => occ.id === specialOccasion)?.label ?? formatRange}
      </div>

      <RangeSlider
        min={0}
        max={11}
        value={[startIndex, endIndex]}
        step={1}
        minGap={1}
        onChange={handleSliderChange}
        aria-label-min="Start month"
        aria-label-max="End month"
        data-testid-min="time-start-slider"
        data-testid-max="time-end-slider"
      />

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