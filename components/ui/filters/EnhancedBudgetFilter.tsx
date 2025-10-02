'use client'

import React, { useState, useCallback } from 'react';
import { useFilter } from '../FilterOverlayContext';
import { DualRangeSlider } from '@/components/ui/DualRangeSlider';
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
        <DualRangeSlider
          min={500}
          max={5000}
          step={100}
          values={[budget.min, budget.max]}
          onChange={(values) => {
            handleBudgetChange('min', values[0]);
            handleBudgetChange('max', values[1]);
          }}
          label="Budget Range"
          ariaLabels={['Minimum budget', 'Maximum budget']}
          formatValue={formatCurrency}
          showValues={false}
          className={styles.sliderContainer}
        />
      )}
    </div>
  );
};
