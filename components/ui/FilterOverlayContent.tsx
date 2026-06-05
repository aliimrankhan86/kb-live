'use client'

import React, { forwardRef, ReactNode } from 'react';
import { useFilterOverlay } from './FilterOverlayContext';
import styles from './FilterOverlay.module.css';

interface FilterOverlayContentProps {
  children: ReactNode;
  className?: string;
}

export const FilterOverlayContent = forwardRef<HTMLDivElement, FilterOverlayContentProps>(
  ({ children, className = '' }, ref) => {
    const { isAnimating, prefersReducedMotion } = useFilterOverlay();
    
    const contentClasses = [
      styles.overlay,
      className,
      isAnimating ? styles.animating : '',
      prefersReducedMotion ? styles.reducedMotion : ''
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={contentClasses}
        role="document"
        tabIndex={-1}
      >
        {children}
      </div>
    );
  }
);

FilterOverlayContent.displayName = 'FilterOverlayContent';
