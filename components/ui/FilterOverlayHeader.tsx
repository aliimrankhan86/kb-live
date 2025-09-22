'use client'

import React from 'react';
import styles from './FilterOverlay.module.css';

interface FilterOverlayHeaderProps {
  title: string;
  onClose: () => void;
  className?: string;
}

export const FilterOverlayHeader: React.FC<FilterOverlayHeaderProps> = ({
  title,
  onClose,
  className = ''
}) => {
  return (
    <header className={`${styles.header} ${className}`}>
      <h2 
        id="filter-title" 
        className={styles.title}
      >
        {title}
      </h2>
      <button
        onClick={onClose}
        className={styles.closeButton}
        aria-label="Close filter overlay"
        type="button"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </header>
  );
};
