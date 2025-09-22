'use client'

import { useEffect } from 'react';

/**
 * Custom hook for handling escape key press
 * Calls the provided callback when escape key is pressed
 */
export const useEscapeKey = (
  isActive: boolean,
  onEscape: () => void
): void => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onEscape]);
};
