'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import styles from './umrah-search-form.module.css'

interface UmrahSearchFormProps {
  className?: string
}

export const UmrahSearchForm: React.FC<UmrahSearchFormProps> = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState([0, 50]) // 0-100 range for slider
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [budgetEnabled, setBudgetEnabled] = useState(true)
  const [budgetRange, setBudgetRange] = useState([500, 1000]) // Start with a reasonable gap

  // Generate quick select options with future years
  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1
  const quickSelectOptions = [
    { id: 'christmas', label: `Christmas: Dec ${currentYear} - Jan ${nextYear}`, value: `Dec ${currentYear} - Jan ${nextYear}` },
    { id: 'easter', label: `Easter: Mar - Apr ${nextYear}`, value: `Mar - Apr ${nextYear}` },
    { id: 'ramadan', label: `Ramadan: May - Jun ${nextYear}`, value: `May - Jun ${nextYear}` },
    { id: 'summer', label: `Summer: Jul - Sep ${nextYear}`, value: `Jul - Sep ${nextYear}` }
  ]

  // Function to generate future date range
  const generateFutureDateRange = (startPercent: number, endPercent: number) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // Calculate months from now (0-24 months in the future)
    // This ensures all dates are always in the future
    const startMonthsFromNow = Math.max(1, Math.floor((startPercent / 100) * 24)) // Minimum 1 month from now
    const endMonthsFromNow = Math.max(startMonthsFromNow + 1, Math.floor((endPercent / 100) * 24)) // At least 1 month after start
    
    const startDate = new Date(currentYear, currentMonth + startMonthsFromNow, 1)
    const endDate = new Date(currentYear, currentMonth + endMonthsFromNow, 1)
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const startMonth = months[startDate.getMonth()]
    const endMonth = months[endDate.getMonth()]
    const startYear = startDate.getFullYear()
    const endYear = endDate.getFullYear()
    
    if (startYear === endYear) {
      return `${startMonth} - ${endMonth} ${startYear}`
    } else {
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`
    }
  }

  // Initialize with a default future date range
  React.useEffect(() => {
    if (!selectedPeriod) {
      setSelectedPeriod(generateFutureDateRange(timeRange[0], timeRange[1]))
    }
  }, [selectedPeriod, timeRange])

  const handleTimeRangeChange = (index: number, value: number) => {
    const newRange = [...timeRange]
    newRange[index] = value
    setTimeRange(newRange)
    
    // Update selected period based on slider values using future dates
    setSelectedPeriod(generateFutureDateRange(newRange[0], newRange[1]))
  }

  const handleQuickSelect = (value: string) => {
    setSelectedPeriod(value)
  }

  const handleBudgetRangeChange = (index: number, value: number) => {
    const newRange = [...budgetRange]
    
    if (index === 0) {
      // Minimum handle - ensure it doesn't exceed maximum
      newRange[0] = Math.min(value, newRange[1] - 50) // Minimum 50 difference
    } else {
      // Maximum handle - ensure it doesn't go below minimum
      newRange[1] = Math.max(value, newRange[0] + 50) // Minimum 50 difference
    }
    
    setBudgetRange(newRange)
  }

  return (
    <div className={`${styles.searchForm} ${className}`}>
      <div className={styles.searchForm__card}>
        <h1 className={styles.searchForm__title}>
          We at Kaaba Trip will help you find the best packages for Umrah
        </h1>

        {/* Time Period Selection */}
        <div className={styles.searchForm__section}>
          <label className={styles.searchForm__label}>
            Select Time Period:
          </label>
          <div className={styles.searchForm__selectedPeriod}>
            {selectedPeriod}
          </div>
          <div className={styles.searchForm__sliderContainer}>
            <div className={styles.searchForm__track}>
              <div 
                className={styles.searchForm__activeTrack}
                style={{
                  left: `${timeRange[0]}%`,
                  width: `${timeRange[1] - timeRange[0]}%`
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={timeRange[0]}
              onChange={(e) => handleTimeRangeChange(0, parseInt(e.target.value))}
              className={styles.searchForm__slider}
              aria-label="Start date"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={timeRange[1]}
              onChange={(e) => handleTimeRangeChange(1, parseInt(e.target.value))}
              className={styles.searchForm__slider}
              aria-label="End date"
            />
          </div>
        </div>

        {/* Quick Select Options */}
        <div className={styles.searchForm__section}>
          <label className={styles.searchForm__label}>
            Or Select One:
          </label>
          <div className={styles.searchForm__quickSelect}>
            {quickSelectOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleQuickSelect(option.value)}
                className={styles.searchForm__quickButton}
                aria-label={`Select ${option.label}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div className={styles.searchForm__section}>
          <label className={styles.searchForm__checkboxLabel}>
            <input
              type="checkbox"
              checked={budgetEnabled}
              onChange={(e) => setBudgetEnabled(e.target.checked)}
              className={styles.searchForm__checkbox}
              aria-label="Enable budget range selection"
            />
            Click to select a preferable budget range
          </label>
          
          {budgetEnabled && (
            <>
              <label className={styles.searchForm__label}>
                Select Budget:
              </label>
              <div className={styles.searchForm__selectedBudget}>
                £{budgetRange[0]} - £{budgetRange[1]} per person
              </div>
              <div className={styles.searchForm__budgetSliderContainer}>
                <div className={styles.searchForm__budgetTrack}>
                  <div 
                    className={styles.searchForm__budgetActiveTrack}
                    style={{
                      left: `${((budgetRange[0] - 300) / (2000 - 300)) * 100}%`,
                      width: `${((budgetRange[1] - budgetRange[0]) / (2000 - 300)) * 100}%`
                    }}
                  />
                </div>
                <input
                  type="range"
                  min="300"
                  max="2000"
                  step="50"
                  value={budgetRange[0]}
                  onChange={(e) => handleBudgetRangeChange(0, parseInt(e.target.value))}
                  className={styles.searchForm__budgetSlider}
                  aria-label="Minimum budget"
                />
                <input
                  type="range"
                  min="300"
                  max="2000"
                  step="50"
                  value={budgetRange[1]}
                  onChange={(e) => handleBudgetRangeChange(1, parseInt(e.target.value))}
                  className={styles.searchForm__budgetSlider}
                  aria-label="Maximum budget"
                />
              </div>
            </>
          )}
        </div>

        {/* Search Button */}
        <Link 
          href="/search/packages"
          className={styles.searchForm__searchButton}
          aria-label="Search for amazing Umrah packages"
        >
          Search For Amazing Packages
        </Link>

        {/* Disclaimer */}
        <p className={styles.searchForm__disclaimer}>
          Currently only available in the UK
        </p>
      </div>
    </div>
  )
}
