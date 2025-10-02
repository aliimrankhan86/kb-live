'use client'

import React from 'react';
import { DualRangeSlider } from '@/components/ui/DualRangeSlider';
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

      <DualRangeSlider
        min={minDistance}
        max={maxDistance}
        step={50}
        values={[value.min, value.max]}
        onChange={(values) => onChange({ min: values[0], max: values[1] })}
        label="Distance Range"
        ariaLabels={['Minimum distance', 'Maximum distance']}
        formatValue={formatDistance}
        showValues={false}
        className={styles.sliderContainer}
      />
    </div>
  );
};
