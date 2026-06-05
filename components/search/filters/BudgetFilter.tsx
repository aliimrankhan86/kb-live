'use client'

import React, { useCallback } from 'react';
import styles from './BudgetFilter.module.css';

interface BudgetFilterProps {
  value: {
    min: number;
    max: number;
  };
  onChange: (budget: { min: number; max: number }) => void;
}

const MIN_BUDGET = 500;
const MAX_BUDGET = 5000;
const STEP = 100;
const MIN_GAP = 200;

export const BudgetFilter: React.FC<BudgetFilterProps> = ({
  value,
  onChange
}) => {
  const clamp = useCallback((v: number) => Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, Math.round(v / STEP) * STEP)), []);

  const handleMinChange = useCallback((min: number) => {
    const clamped = clamp(min);
    onChange({ min: Math.min(clamped, value.max - MIN_GAP), max: value.max });
  }, [clamp, onChange, value.max]);

  const handleMaxChange = useCallback((max: number) => {
    const clamped = clamp(max);
    onChange({ min: value.min, max: Math.max(clamped, value.min + MIN_GAP) });
  }, [clamp, onChange, value.min]);

  const getPercentage = useCallback((amount: number) => {
    return ((amount - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;
  }, []);

  const formatCurrency = (amount: number) => {
    return `£${amount.toLocaleString('en-GB')}`;
  };

  const leftPercent = getPercentage(value.min);
  const rightPercent = getPercentage(value.max);
  const activeWidth = rightPercent - leftPercent;

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Budget</h3>
      
      <div className={styles.selectedBudget} aria-live="polite">
        {formatCurrency(value.min)} — {formatCurrency(value.max)}
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
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step={STEP}
            value={value.min}
            onChange={(e) => handleMinChange(parseInt(e.target.value))}
            className={styles.rangeInput}
            aria-label="Minimum budget"
            data-testid="budget-min-slider"
          />
          <input
            type="range"
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step={STEP}
            value={value.max}
            onChange={(e) => handleMaxChange(parseInt(e.target.value))}
            className={styles.rangeInput}
            aria-label="Maximum budget"
            data-testid="budget-max-slider"
          />
        </div>
        
        <div className={styles.labels}>
          <span className={styles.minLabel}>{formatCurrency(MIN_BUDGET)}</span>
          <span className={styles.maxLabel}>{formatCurrency(MAX_BUDGET)}</span>
        </div>
      </div>
    </div>
  );
};