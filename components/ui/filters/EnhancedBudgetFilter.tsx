'use client'

import React, { useState, useCallback } from 'react';
import { useFilter } from '../FilterOverlayContext';
import styles from './EnhancedBudgetFilter.module.css';

export const EnhancedBudgetFilter: React.FC = () => {
  const [budget, setBudget] = useFilter('budget');
  const [isEnabled, setIsEnabled] = useState(true);

  const handleBudgetChange = useCallback((type: 'min' | 'max', value: number) => {
    const newBudget = { ...budget, [type]: value };
    setBudget(newBudget);
  }, [budget, setBudget]);

  const handleToggleEnabled = useCallback(() => {
    setIsEnabled(!isEnabled);
  }, [isEnabled]);

  const formatCurrency = (amount: number) => {
    return `£${amount.toLocaleString()}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="budget-enabled"
            checked={isEnabled}
            onChange={handleToggleEnabled}
            className={styles.checkbox}
          />
          <label htmlFor="budget-enabled" className={styles.checkboxLabel}>
            Click to select a preferable budget range
          </label>
        </div>
        
        <h3 className={styles.label}>Select Budget:</h3>
        
        {isEnabled && (
          <div className={styles.selectedDisplay}>
            {formatCurrency(budget.min)} - {formatCurrency(budget.max)} per person
          </div>
        )}
      </div>

      {isEnabled && (
        <div className={styles.sliderContainer}>
          <div className={styles.track}>
            <div 
              className={styles.activeTrack}
              style={{
                left: `${((budget.min - 500) / (5000 - 500)) * 100}%`,
                width: `${((budget.max - budget.min) / (5000 - 500)) * 100}%`
              }}
            />
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={budget.min}
              onChange={(e) => handleBudgetChange('min', parseInt(e.target.value))}
              className={styles.rangeInput}
              aria-label="Minimum budget"
            />
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={budget.max}
              onChange={(e) => handleBudgetChange('max', parseInt(e.target.value))}
              className={styles.rangeInput}
              aria-label="Maximum budget"
            />
          </div>
          
          <div className={styles.labels}>
            <span className={styles.minLabel}>{formatCurrency(500)}</span>
            <span className={styles.maxLabel}>{formatCurrency(5000)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
