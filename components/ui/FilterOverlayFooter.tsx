'use client'

import React from 'react';
import styles from './FilterOverlay.module.css';

interface FilterOverlayFooterProps {
  showResetButton?: boolean;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

export const FilterOverlayFooter: React.FC<FilterOverlayFooterProps> = ({
  showResetButton = true,
  onApply,
  onReset,
  className = ''
}) => {
  return (
    <footer className={`${styles.footer} ${className}`}>
      {showResetButton && (
        <button
          onClick={onReset}
          className={styles.resetButton}
          type="button"
          aria-label="Reset all filters to default values"
        >
          Reset Filters
        </button>
      )}
      <button
        onClick={onApply}
        className={styles.applyButton}
        type="button"
        aria-label="Apply current filter selections"
      >
        Apply Filters
      </button>
    </footer>
  );
};
