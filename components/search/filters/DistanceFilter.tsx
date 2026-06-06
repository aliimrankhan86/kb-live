import React, { useCallback } from 'react';
import { RangeSlider } from '@/components/ui/RangeSlider';
import styles from './DistanceFilter.module.css';

interface DistanceFilterProps {
  value: {
    min: number;
    max: number;
  };
  onChange: (distance: { min: number; max: number }) => void;
}

const MIN_DISTANCE = 50;
const MAX_DISTANCE = 5000;
const STEP = 50;
const MIN_GAP = 200;

export const DistanceFilter: React.FC<DistanceFilterProps> = ({
  value,
  onChange
}) => {
  const formatDistance = useCallback((distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${distance} metres`;
  }, []);

  const handleChange = useCallback(([min, max]: [number, number]) => {
    onChange({ min, max });
  }, [onChange]);

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Distance from Haram</h3>
      
      <div className={styles.selectedDistance} aria-live="polite">
        {formatDistance(value.min)} — {formatDistance(value.max)}
      </div>

      <RangeSlider
        min={MIN_DISTANCE}
        max={MAX_DISTANCE}
        value={[value.min, value.max]}
        step={STEP}
        minGap={MIN_GAP}
        onChange={handleChange}
        minLabel={formatDistance(MIN_DISTANCE)}
        maxLabel={formatDistance(MAX_DISTANCE)}
        ariaLabelMin="Minimum distance"
        ariaLabelMax="Maximum distance"
        data-testid-min="distance-min-slider"
        data-testid-max="distance-max-slider"
      />
    </div>
  );
};