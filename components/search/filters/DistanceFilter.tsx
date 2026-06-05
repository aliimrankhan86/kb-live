'use client'

import React, { useCallback } from 'react';
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
  const clamp = useCallback((v: number) => Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, Math.round(v / STEP) * STEP)), []);

  const handleMinChange = useCallback((min: number) => {
    const clamped = clamp(min);
    onChange({ min: Math.min(clamped, value.max - MIN_GAP), max: value.max });
  }, [clamp, onChange, value.max]);

  const handleMaxChange = useCallback((max: number) => {
    const clamped = clamp(max);
    onChange({ min: value.min, max: Math.max(clamped, value.min + MIN_GAP) });
  }, [clamp, onChange, value.min]);

  const getPercentage = useCallback((distance: number) => {
    return ((distance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE)) * 100;
  }, []);

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${distance} m`;
  };

  const leftPercent = getPercentage(value.min);
  const rightPercent = getPercentage(value.max);
  const activeWidth = rightPercent - leftPercent;

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Distance from Haram</h3>
      
      <div className={styles.selectedDistance} aria-live="polite">
        {formatDistance(value.min)} — {formatDistance(value.max)}
      </div>

      <div className={styles.sliderContainer}>
        <div className={styles.trackWrapper}>
          <div className={styles.track} />
          <div 
            className={styles.activeTrack}
            style={{
              left: `${leftPercent}%`,
              width: `${activeWidth}%`
            }}
          />
          <input
            type="range"
            min={MIN_DISTANCE}
            max={MAX_DISTANCE}
            step={STEP}
            value={value.min}
            onChange={(e) => handleMinChange(parseInt(e.target.value))}
            className={styles.rangeInput}
            aria-label="Minimum distance"
            data-testid="distance-min-slider"
          />
          <input
            type="range"
            min={MIN_DISTANCE}
            max={MAX_DISTANCE}
            step={STEP}
            value={value.max}
            onChange={(e) => handleMaxChange(parseInt(e.target.value))}
            className={styles.rangeInput}
            aria-label="Maximum distance"
            data-testid="distance-max-slider"
          />
        </div>
        
        <div className={styles.labels}>
          <span className={styles.minLabel}>{formatDistance(MIN_DISTANCE)}</span>
          <span className={styles.maxLabel}>{formatDistance(MAX_DISTANCE)}</span>
        </div>
      </div>
    </div>
  );
};