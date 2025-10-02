'use client'

import React from 'react';
import { DualRangeSlider } from '@/components/ui/DualRangeSlider';
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

      <DualRangeSlider
        min={minBudget}
        max={maxBudget}
        step={100}
        values={[value.min, value.max]}
        onChange={(values) => onChange({ min: values[0], max: values[1] })}
        label="Budget Range"
        ariaLabels={['Minimum budget', 'Maximum budget']}
        formatValue={(val) => `$${val.toLocaleString()}`}
        showValues={false}
        className={styles.sliderContainer}
      />
    </div>
  );
};
