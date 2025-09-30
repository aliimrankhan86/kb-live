'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SortOption, SortState, SORT_OPTIONS, getSortConfig } from '@/lib/sort-types';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import styles from './SortDropdown.module.css';

export interface SortDropdownProps {
  /** Current sort option */
  value: SortOption;
  /** Callback when sort option changes */
  onChange: (option: SortOption) => void;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * SortDropdown Component
 * 
 * A fully accessible dropdown component for sorting packages that follows
 * the established design system and component patterns.
 * 
 * Features:
 * - Full keyboard navigation support
 * - Screen reader accessibility
 * - Click outside to close
 * - Escape key to close
 * - Focus management
 * - Consistent styling with existing components
 * - Responsive design
 */
export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  ariaLabel = 'Sort packages'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Get current sort configuration
  const currentConfig = getSortConfig(value);

  // Handle click outside to close
  useClickOutside(dropdownRef, isOpen ? () => setIsOpen(false) : () => {});

  // Handle escape key to close
  useEscapeKey(isOpen, () => setIsOpen(false));

  // Focus trap when dropdown is open
  useFocusTrap(dropdownRef, isOpen);

  // Handle button click
  const handleButtonClick = useCallback(() => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setFocusedIndex(-1);
  }, [disabled, isOpen]);

  // Handle option selection
  const handleOptionSelect = useCallback((option: SortOption) => {
    onChange(option);
    setIsOpen(false);
    setFocusedIndex(-1);
    
    // Return focus to button
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const option = SORT_OPTIONS[focusedIndex];
          if (option) {
            handleOptionSelect(option.value);
          }
        } else {
          setIsOpen(!isOpen);
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < SORT_OPTIONS.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : SORT_OPTIONS.length - 1
          );
        }
        break;

      case 'Escape':
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
    }
  }, [disabled, isOpen, focusedIndex, handleOptionSelect]);

  // Update option refs array when options change
  useEffect(() => {
    optionRefs.current = optionRefs.current.slice(0, SORT_OPTIONS.length);
  }, []);

  // Focus the focused option when it changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  // Reset focused index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  return (
    <div 
      ref={dropdownRef}
      className={`${styles.dropdown} ${className}`}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label={ariaLabel}
    >
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.button} ${isOpen ? styles.buttonOpen : ''} ${disabled ? styles.buttonDisabled : ''}`}
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${ariaLabel}: ${currentConfig?.label || 'Select sort option'}`}
      >
        <span className={styles.buttonContent}>
          <span className={styles.buttonText}>
            {currentConfig?.icon && (
              <span className={styles.buttonIcon} aria-hidden="true">
                {currentConfig.icon}
              </span>
            )}
            {currentConfig?.label || 'Sort'}
          </span>
          <svg 
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </span>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div 
          className={styles.options}
          role="listbox"
          aria-label="Sort options"
        >
          {SORT_OPTIONS.map((option, index) => (
            <button
              key={option.value}
              ref={el => optionRefs.current[index] = el}
              type="button"
              className={`${styles.option} ${value === option.value ? styles.optionSelected : ''} ${focusedIndex === index ? styles.optionFocused : ''}`}
              onClick={() => handleOptionSelect(option.value)}
              onKeyDown={handleKeyDown}
              role="option"
              aria-selected={value === option.value}
              aria-label={`${option.label}: ${option.description}`}
            >
              <div className={styles.optionContent}>
                <div className={styles.optionHeader}>
                  {option.icon && (
                    <span className={styles.optionIcon} aria-hidden="true">
                      {option.icon}
                    </span>
                  )}
                  <span className={styles.optionLabel}>{option.label}</span>
                  {value === option.value && (
                    <svg 
                      className={styles.checkIcon}
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                </div>
                <div className={styles.optionDescription}>
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
