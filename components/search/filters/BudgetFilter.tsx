'use client'

import React from 'react';
import styles from './BudgetFilter.module.css';

interface BudgetFilterProps {
  value: {
    min: number;
    max: number;
  };
  onChange: (budget: { min: number; max: number }) => void;
}

const minBudget = 500;
const maxBudget = 5000;

export const BudgetFilter: React.FC<BudgetFilterProps> = ({
  value,
  onChange
}) => {
  const handleMinChange = (min: number) => {
    onChange({ ...value, min: Math.min(min, value.max) });
  };

  const handleMaxChange = (max: number) => {
    onChange({ ...value, max: Math.max(max, value.min) });
  };

  const getPercentage = (amount: number) => {
    return ((amount - minBudget) / (maxBudget - minBudget)) * 100;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Budget:</h3>
      
      <div className={styles.selectedBudget}>
        ${value.min.toLocaleString()} - ${value.max.toLocaleString()}
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
            min={minBudget}
            max={maxBudget}
            step="100"
            value={value.min}
            onChange={(e) => handleMinChange(parseInt(e.target.value))}
            className={styles.rangeInput}
            aria-label="Minimum budget"
          />
          <input
            type="range"
            min={minBudget}
            max={maxBudget}
            step="100"
            value={value.max}
            onChange={(e) => handleMaxChange(parseInt(e.target.value))}
            className={styles.rangeInput}
            aria-label="Maximum budget"
          />
        </div>
        
        <div className={styles.labels}>
          <span className={styles.minLabel}>${minBudget.toLocaleString()}</span>
          <span className={styles.maxLabel}>${maxBudget.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
