'use client'

import React, { useState, useCallback } from 'react'
import styles from './PeopleSelector.module.css'

export type PeopleBucket = '1-2' | '3-4' | '5' | '5+'

export interface PeopleSelectorProps {
  value: PeopleBucket | null
  onChange: (value: PeopleBucket) => void
  label?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

const PEOPLE_OPTIONS: Array<{ value: PeopleBucket; label: string; description: string }> = [
  { value: '1-2', label: '1 to 2', description: '1-2 people' },
  { value: '3-4', label: '3 to 4', description: '3-4 people' },
  { value: '5', label: 'up to 5', description: 'Up to 5 people' },
  { value: '5+', label: 'more than 5', description: 'More than 5 people' }
]

export const PeopleSelector: React.FC<PeopleSelectorProps> = ({
  value,
  onChange,
  label = 'Number of people',
  disabled = false,
  className = '',
  required = false
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const handleSelect = useCallback((optionValue: PeopleBucket) => {
    if (!disabled) {
      onChange(optionValue)
    }
  }, [onChange, disabled])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (disabled) return

    const options = PEOPLE_OPTIONS
    let nextIndex = index

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        nextIndex = (index + 1) % options.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        nextIndex = (index - 1 + options.length) % options.length
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        handleSelect(options[index].value)
        return
      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break
      case 'End':
        e.preventDefault()
        nextIndex = options.length - 1
        break
    }

    if (nextIndex !== index) {
      setFocusedIndex(nextIndex)
    }
  }, [disabled, handleSelect])

  return (
    <div className={`${styles.selectorContainer} ${className}`}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </legend>
        
        <div 
          className={styles.optionsGrid}
          role="radiogroup"
          aria-label={label}
        >
          {PEOPLE_OPTIONS.map((option, index) => (
            <label
              key={option.value}
              className={`${styles.option} ${value === option.value ? styles.optionSelected : ''} ${focusedIndex === index ? styles.optionFocused : ''} ${disabled ? styles.optionDisabled : ''}`}
            >
              <input
                type="radio"
                name="numberOfPeopleBucket"
                value={option.value}
                checked={value === option.value}
                onChange={() => handleSelect(option.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                disabled={disabled}
                className={styles.radioInput}
                aria-describedby={`${option.value}-description`}
              />
              <span className={styles.optionLabel}>{option.label}</span>
              <span 
                id={`${option.value}-description`}
                className={styles.optionDescription}
              >
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default PeopleSelector
