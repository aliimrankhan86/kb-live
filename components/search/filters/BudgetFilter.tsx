import React, { useCallback } from 'react';
import { RangeSlider } from '@/components/ui/RangeSlider';
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
  const formatCurrency = useCallback((amount: number) => {
    return `£${amount.toLocaleString('en-GB')}`;
  }, []);

  const handleChange = useCallback(([min, max]: [number, number]) => {
    onChange({ min, max });
  }, [onChange]);

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Budget</h3>
      
      <div className={styles.selectedBudget} aria-live="polite">
        {formatCurrency(value.min)} — {formatCurrency(value.max)}
      </div>

      <RangeSlider
        min={MIN_BUDGET}
        max={MAX_BUDGET}
        value={[value.min, value.max]}
        step={STEP}
        minGap={MIN_GAP}
        onChange={handleChange}
        minLabel={formatCurrency(MIN_BUDGET)}
        maxLabel={formatCurrency(MAX_BUDGET)}
        ariaLabelMin="Minimum budget"
        ariaLabelMax="Maximum budget"
        data-testid-min="budget-min-slider"
        data-testid-max="budget-max-slider"
      />
    </div>
  );
};