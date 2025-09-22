'use client'

import React from 'react';
import styles from './DistanceFilter.module.css';

interface DistanceFilterProps {
  value: {
    min: number;
    max: number;
  };
  onChange: (distance: { min: number; max: number }) => void;
}

const minDistance = 50;
const maxDistance = 5000;

export const DistanceFilter: React.FC<DistanceFilterProps> = ({
  value,
  onChange
}) => {
  const handleMinChange = (min: number) => {
    onChange({ ...value, min: Math.min(min, value.max) });
  };

  const handleMaxChange = (max: number) => {
    onChange({ ...value, max: Math.max(max, value.min) });
  };

  const getPercentage = (distance: number) => {
    return ((distance - minDistance) / (maxDistance - minDistance)) * 100;
  };

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }
    return `${distance}m`;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Distance from Hotel:</h3>
      
      <div className={styles.selectedDistance}>
        {formatDistance(value.min)} - {formatDistance(value.max)}
      </div>

      <div className={styles.sliderContainer}>
        <div className={styles.track}>
          <div 
            className={styles.activeTrack}
            style={{
              left: `${getPercentage(value.min)}%`,
              width: `${getPercentage(value.max) - getPercentage(value.min)}%`
            }}
          />
          <input
            type="range"
            min={minDistance}
            max={maxDistance}
            step="50"
            value={value.min}
            onChange={(e) => handleMinChange(parseInt(e.target.value))}
            className={styles.rangeInput}
            aria-label="Minimum distance"
          />
          <input
            type="range"
            min={minDistance}
            max={maxDistance}
            step="50"
            value={value.max}
            onChange={(e) => handleMaxChange(parseInt(e.target.value))}
            className={styles.rangeInput}
            aria-label="Maximum distance"
          />
        </div>
        
        <div className={styles.labels}>
          <span className={styles.minLabel}>{formatDistance(minDistance)}</span>
          <span className={styles.maxLabel}>{formatDistance(maxDistance)}</span>
        </div>
      </div>
    </div>
  );
};
