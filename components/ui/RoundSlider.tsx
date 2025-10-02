'use client'

import React, { useState, useCallback } from 'react'
import styles from './RoundSlider.module.css'

/**
 * Centralized Round Slider Component
 * 
 * Provides standardized slider functionality with:
 * - Canonical size: 24px thumb, 8px track height
 * - Dim yellow active color using --yellowDim token (#D4AF37)
 * - Responsive behavior: 44px+ touch targets on mobile
 * - Keyboard navigation: Arrow keys, Home, End
 * - Accessibility: ARIA labels, focus management
 * - High contrast mode support
 * - Reduced motion support
 */

export interface RoundSliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  label?: string
  ariaLabel?: string
  disabled?: boolean
  className?: string
  showValue?: boolean
  formatValue?: (value: number) => string
}

export const RoundSlider: React.FC<RoundSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  ariaLabel,
  disabled = false,
  className = '',
  showValue = true,
  formatValue = (val) => val.toString()
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    onChange(newValue)
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    const stepAmount = step || 1
    let newValue = value

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault()
        newValue = Math.min(value + stepAmount, max)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault()
        newValue = Math.max(value - stepAmount, min)
        break
      case 'Home':
        e.preventDefault()
        newValue = min
        break
      case 'End':
        e.preventDefault()
        newValue = max
        break
    }

    if (newValue !== value) {
      onChange(newValue)
    }
  }, [disabled, step, value, min, max, onChange])

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`${styles.sliderContainer} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      
      <div className={styles.sliderWrapper}>
        <div className={styles.track}>
          <div 
            className={styles.activeTrack}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`${styles.slider} ${isFocused ? styles.sliderFocused : ''} ${disabled ? styles.sliderDisabled : ''}`}
          aria-label={ariaLabel || label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formatValue(value)}
        />
        
        {showValue && (
          <div className={styles.valueDisplay}>
            {formatValue(value)}
          </div>
        )}
      </div>
    </div>
  )
}

export default RoundSlider
