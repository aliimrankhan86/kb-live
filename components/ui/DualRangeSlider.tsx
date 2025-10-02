'use client'

import React, { useState, useCallback } from 'react'
import styles from './DualRangeSlider.module.css'

/**
 * Dual Range Slider Component
 * 
 * Provides standardized dual-range slider functionality with:
 * - Canonical size: 24px thumb, 8px track height
 * - Dim yellow active color using --yellowDim token (#D4AF37)
 * - Constraint handling: min cannot exceed max, vice versa
 * - Responsive behavior: 44px+ touch targets on mobile
 * - Keyboard navigation: Arrow keys, Home, End for both handles
 * - Accessibility: ARIA labels, focus management for both sliders
 * - High contrast mode support
 * - Reduced motion support
 */

export interface DualRangeSliderProps {
  min: number
  max: number
  step?: number
  values: [number, number]
  onChange: (values: [number, number]) => void
  label?: string
  ariaLabels?: [string, string]
  disabled?: boolean
  className?: string
  showValues?: boolean
  formatValue?: (value: number) => string
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  step = 1,
  values,
  onChange,
  label,
  ariaLabels,
  disabled = false,
  className = '',
  showValues = true,
  formatValue = (val) => val.toString()
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const handleChange = useCallback((index: number, newValue: number) => {
    const newValues: [number, number] = [...values]
    newValues[index] = newValue
    
    // Ensure min doesn't exceed max and vice versa
    if (index === 0) {
      newValues[0] = Math.min(newValue, newValues[1] - step)
    } else {
      newValues[1] = Math.max(newValue, newValues[0] + step)
    }
    
    onChange(newValues)
  }, [values, onChange, step])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    const stepAmount = step || 1
    let newValue = values[index]

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault()
        newValue = Math.min(values[index] + stepAmount, max)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault()
        newValue = Math.max(values[index] - stepAmount, min)
        break
      case 'Home':
        e.preventDefault()
        newValue = index === 0 ? min : values[0] + step
        break
      case 'End':
        e.preventDefault()
        newValue = index === 1 ? max : values[1] - step
        break
    }

    if (newValue !== values[index]) {
      handleChange(index, newValue)
    }
  }, [disabled, step, values, min, max, handleChange])

  const getPercentage = (value: number) => ((value - min) / (max - min)) * 100
  const minPercentage = getPercentage(values[0])
  const maxPercentage = getPercentage(values[1])
  const trackWidth = maxPercentage - minPercentage

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
            style={{
              left: `${minPercentage}%`,
              width: `${trackWidth}%`
            }}
          />
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={values[0]}
          onChange={(e) => handleChange(0, parseInt(e.target.value))}
          onKeyDown={(e) => handleKeyDown(0, e)}
          onFocus={() => setFocusedIndex(0)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          className={`${styles.slider} ${styles.sliderMin} ${focusedIndex === 0 ? styles.sliderFocused : ''} ${disabled ? styles.sliderDisabled : ''}`}
          aria-label={ariaLabels?.[0] || `${label} minimum`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={values[0]}
          aria-valuetext={formatValue(values[0])}
        />
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={values[1]}
          onChange={(e) => handleChange(1, parseInt(e.target.value))}
          onKeyDown={(e) => handleKeyDown(1, e)}
          onFocus={() => setFocusedIndex(1)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          className={`${styles.slider} ${styles.sliderMax} ${focusedIndex === 1 ? styles.sliderFocused : ''} ${disabled ? styles.sliderDisabled : ''}`}
          aria-label={ariaLabels?.[1] || `${label} maximum`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={values[1]}
          aria-valuetext={formatValue(values[1])}
        />
        
        {showValues && (
          <div className={styles.valueDisplay}>
            <span>{formatValue(values[0])}</span>
            <span> - </span>
            <span>{formatValue(values[1])}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default DualRangeSlider
