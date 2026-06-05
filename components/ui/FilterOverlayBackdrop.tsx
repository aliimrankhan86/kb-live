'use client'

import React, { ReactNode } from 'react';
import styles from './FilterOverlay.module.css';

interface FilterOverlayBackdropProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const FilterOverlayBackdrop: React.FC<FilterOverlayBackdropProps> = ({
  children,
  className = '',
  style,
  ariaLabel = 'Filter overlay backdrop',
  onClick
}) => {
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger if clicking the backdrop itself, not children
    if (event.target === event.currentTarget) {
      onClick?.(event);
    }
  };

  return (
    <div
      className={`${styles.backdrop} ${className}`}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );
};
