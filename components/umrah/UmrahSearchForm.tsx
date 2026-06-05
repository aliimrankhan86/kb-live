'use client'

import React, { useState, useCallback, useMemo } from 'react'
import styles from './umrah-search-form.module.css'

interface ChildInfo {
  age: number
}

interface UmrahSearchFormProps {
  className?: string
}

// Generate dates relative to today for sensible defaults
const today = new Date()
const currentYear = today.getFullYear()

// Default departure: 3 months from now
const defaultDeparture = new Date(today.getFullYear(), today.getMonth() + 3, 1)
// Default return: 14 days after departure
const defaultReturn = new Date(defaultDeparture.getFullYear(), defaultDeparture.getMonth(), defaultDeparture.getDate() + 14)

const formatISODate = (d: Date) => d.toISOString().split('T')[0]

const parseInputDate = (v: string) => {
  const [y, m, d] = v.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const UmrahSearchForm: React.FC<UmrahSearchFormProps> = ({ className = '' }) => {
  const [departureDate, setDepartureDate] = useState(formatISODate(defaultDeparture))
  const [returnDate, setReturnDate] = useState(formatISODate(defaultReturn))
  const [selectedQuickPick, setSelectedQuickPick] = useState<string>('')
  const [budgetEnabled, setBudgetEnabled] = useState(true)
  const [budgetRange, setBudgetRange] = useState([500, 1000])
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState<ChildInfo[]>([])
  const [hotelStars, setHotelStars] = useState<number | null>(null)

  const minBudgetValue = 300
  const maxBudgetValue = 2000
  const minBudget = Math.min(budgetRange[0], budgetRange[1])
  const maxBudget = Math.max(budgetRange[0], budgetRange[1])
  const budgetRangeStart = ((minBudget - minBudgetValue) / (maxBudgetValue - minBudgetValue)) * 100
  const budgetRangeWidth = ((maxBudget - minBudgetValue) / (maxBudgetValue - minBudgetValue)) * 100 - budgetRangeStart

  const nextYear = currentYear + 1

  // Quick select options with real date ranges (use hyphens, not em dashes)
  const quickSelectOptions = useMemo(() => [
    { 
      id: 'christmas', 
      label: `Christmas: Dec ${currentYear} - Jan ${nextYear}`, 
      season: 'school-holidays',
      getDates: () => ({ start: `${currentYear}-12-20`, end: `${nextYear}-01-05` })
    },
    { 
      id: 'easter', 
      label: `Easter: Mar - Apr ${nextYear}`, 
      season: 'school-holidays',
      getDates: () => ({ start: `${nextYear}-03-20`, end: `${nextYear}-04-10` })
    },
    { 
      id: 'ramadan', 
      label: `Ramadan: May - Jun ${nextYear}`, 
      season: 'ramadan',
      getDates: () => ({ start: `${nextYear}-05-01`, end: `${nextYear}-06-15` })
    },
    { 
      id: 'summer', 
      label: `Summer: Jul - Sep ${nextYear}`, 
      season: 'flexible',
      getDates: () => ({ start: `${nextYear}-07-01`, end: `${nextYear}-09-15` })
    }
  ], [nextYear])

  const handleQuickSelect = useCallback((id: string) => {
    const option = quickSelectOptions.find(o => o.id === id)
    if (!option) return
    const dates = option.getDates()
    setDepartureDate(dates.start)
    setReturnDate(dates.end)
    setSelectedQuickPick(id)
  }, [quickSelectOptions])

  const handleDepartureChange = useCallback((v: string) => {
    setDepartureDate(v)
    setSelectedQuickPick('')
    // Ensure return is after departure
    const dep = parseInputDate(v)
    const ret = parseInputDate(returnDate)
    if (ret <= dep) {
      const newRet = new Date(dep.getFullYear(), dep.getMonth(), dep.getDate() + 14)
      setReturnDate(formatISODate(newRet))
    }
  }, [returnDate])

  const handleReturnChange = useCallback((v: string) => {
    setReturnDate(v)
    setSelectedQuickPick('')
  }, [])

  const seasonParam = quickSelectOptions.find((o) => o.id === selectedQuickPick)?.season ?? 'flexible'

  const handleBudgetRangeChange = useCallback((index: number, value: number) => {
    const newRange = [...budgetRange]
    if (index === 0) {
      newRange[0] = Math.min(value, newRange[1] - 50)
    } else {
      newRange[1] = Math.max(value, newRange[0] + 50)
    }
    setBudgetRange(newRange)
  }, [budgetRange])

  const starsOptions = [
    { value: null, label: 'Any' },
    { value: 5, label: '5 stars' },
    { value: 4, label: '4 stars' },
    { value: 3, label: '3 stars' },
  ]

  // Child age helpers
  const MAX_CHILDREN = 6
  const MIN_CHILD_AGE = 0
  const MAX_CHILD_AGE = 11
  const INFANT_MAX_AGE = 1

  const addChild = useCallback(() => {
    if (children.length < MAX_CHILDREN) {
      setChildren(prev => [...prev, { age: 1 }])
    }
  }, [children.length])

  const removeChild = useCallback(() => {
    if (children.length > 0) {
      setChildren(prev => prev.slice(0, -1))
    }
  }, [children.length])

  const updateChildAge = useCallback((index: number, age: number) => {
    const clampedAge = Math.max(MIN_CHILD_AGE, Math.min(MAX_CHILD_AGE, age))
    setChildren(prev => {
      const newChildren = [...prev]
      newChildren[index] = { age: clampedAge }
      return newChildren
    })
  }, [])

  const getChildLabel = (age: number) => {
    if (age <= INFANT_MAX_AGE) return 'Infant (under 2)'
    return `Child (age ${age})`
  }

  const travellerSummary = useCallback(() => {
    const parts = [`${adults} Adult${adults !== 1 ? 's' : ''}`]
    const infantCount = children.filter((c) => c.age <= INFANT_MAX_AGE).length
    const childCount = children.filter((c) => c.age > INFANT_MAX_AGE).length
    if (infantCount > 0) parts.push(`${infantCount} Infant${infantCount !== 1 ? 's' : ''}`)
    if (childCount > 0) parts.push(`${childCount} Child${childCount !== 1 ? 'ren' : ''}`)
    return parts.join(', ')
  }, [adults, children])

  const formatDisplayDate = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Refs for calendar icon clicks
  const departureInputRef = React.useRef<HTMLInputElement>(null)
  const returnInputRef = React.useRef<HTMLInputElement>(null)

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateDates = useCallback(() => {
    const newErrors: Record<string, string> = {}
    const dep = parseInputDate(departureDate)
    const ret = parseInputDate(returnDate)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    if (dep < todayStart) {
      newErrors.departureDate = 'Departure date cannot be in the past'
    }
    if (ret <= dep) {
      newErrors.returnDate = 'Return date must be after the departure date'
    } else {
      const diffMs = ret.getTime() - dep.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      if (diffDays < 7) {
        newErrors.returnDate = 'Umrah trips require at least 7 days'
      }
      if (diffDays > 60) {
        newErrors.returnDate = 'Return date cannot be more than 60 days after departure'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [departureDate, returnDate])

  const handleFormSubmit = (e: React.FormEvent) => {
    if (!validateDates()) {
      e.preventDefault()
    }
  }

  const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      if (typeof ref.current.showPicker === 'function') {
        ref.current.showPicker()
      } else {
        ref.current.click()
      }
    }
  }

  // Replace em dashes with regular hyphens to avoid AI-generated look
  const toHyphen = (s: string) => s.replace(/\u2013/g, '-')

  return (
    <div className={`${styles.searchForm} ${className}`}>
      <form
        action="/search/packages"
        method="get"
        className={styles.searchForm__card}
        noValidate
        onSubmit={handleFormSubmit}
      >
        <input type="hidden" name="type" value="umrah" />
        <input type="hidden" name="season" value={seasonParam} />
        <input type="hidden" name="adults" value={String(adults)} />
        <input type="hidden" name="departureDate" value={departureDate} />
        <input type="hidden" name="returnDate" value={returnDate} />
        {children.length > 0 && (
          <input type="hidden" name="children" value={JSON.stringify(children.map((c) => c.age))} />
        )}
        {hotelStars && <input type="hidden" name="hotelStars" value={String(hotelStars)} />}
        {budgetEnabled && (
          <>
            <input type="hidden" name="budgetMin" value={String(minBudget)} />
            <input type="hidden" name="budgetMax" value={String(maxBudget)} />
          </>
        )}

        {/* Header */}
        <div className={styles.searchForm__header}>
          <h1 className={styles.searchForm__title}>
            Find Your Umrah Package
          </h1>
          <p className={styles.searchForm__subtitle}>
            Select your preferences and compare packages from verified operators
          </p>
        </div>

        {/* Step 1: Travel dates */}
        <div className={styles.searchForm__section}>
          <div className={styles.searchForm__sectionHeader}>
            <span className={styles.searchForm__stepNumber}>1</span>
            <label className={styles.searchForm__label}>
              When would you like to travel?
            </label>
          </div>
          
          {/* Date Picker Inputs */}
          <div className={styles.searchForm__dateInputs}>
            <div className={styles.searchForm__dateField}>
              <label htmlFor="departure-date" className={styles.searchForm__dateLabel}>
                Departure
              </label>
              <div
                className={styles.searchForm__dateInputWrapper}
                onClick={() => openDatePicker(departureInputRef)}
                role="button"
                tabIndex={0}
                aria-label="Open departure date picker"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDatePicker(departureInputRef) } }}
              >
                <input
                  ref={departureInputRef}
                  id="departure-date"
                  type="date"
                  value={departureDate}
                  onChange={(e) => handleDepartureChange(e.target.value)}
                  min={formatISODate(today)}
                  className={styles.searchForm__dateInput}
                  aria-label="Departure date"
                  data-testid="departure-date-input"
                />
                <svg className={styles.searchForm__dateIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className={styles.searchForm__dateDisplay} aria-hidden="true">
                {formatDisplayDate(departureDate)}
              </span>
              {errors.departureDate && (
                <span className={styles.searchForm__dateError} role="alert" data-testid="departure-date-error">
                  {errors.departureDate}
                </span>
              )}
            </div>
            <div className={styles.searchForm__dateField}>
              <label htmlFor="return-date" className={styles.searchForm__dateLabel}>
                Return
              </label>
              <div
                className={styles.searchForm__dateInputWrapper}
                onClick={() => openDatePicker(returnInputRef)}
                role="button"
                tabIndex={0}
                aria-label="Open return date picker"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDatePicker(returnInputRef) } }}
              >
                <input
                  ref={returnInputRef}
                  id="return-date"
                  type="date"
                  value={returnDate}
                  onChange={(e) => handleReturnChange(e.target.value)}
                  min={departureDate}
                  className={styles.searchForm__dateInput}
                  aria-label="Return date"
                  data-testid="return-date-input"
                />
                <svg className={styles.searchForm__dateIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className={styles.searchForm__dateDisplay} aria-hidden="true">
                {formatDisplayDate(returnDate)}
              </span>
              {errors.returnDate && (
                <span className={styles.searchForm__dateError} role="alert" data-testid="return-date-error">
                  {errors.returnDate}
                </span>
              )}
            </div>
          </div>

          {/* Quick Select Options */}
          <div className={styles.searchForm__quickSelect}>
            {quickSelectOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleQuickSelect(option.id)}
                className={`${styles.searchForm__quickButton} ${selectedQuickPick === option.id ? styles.searchForm__quickButtonActive : ''}`}
                aria-label={`Select ${option.label}`}
                aria-pressed={selectedQuickPick === option.id}
                data-testid={`quick-select-${option.id}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Travellers */}
        <div className={styles.searchForm__section}>
          <div className={styles.searchForm__sectionHeader}>
            <span className={styles.searchForm__stepNumber}>2</span>
            <label className={styles.searchForm__label}>
              How many travellers?
            </label>
          </div>

          {/* Adults */}
          <div className={styles.searchForm__travellerRow}>
            <span className={styles.searchForm__travellerLabel}>Adults <span className={styles.searchForm__travellerHint}>(12+ years)</span></span>
            <div className={styles.searchForm__stepper}>
              <button
                type="button"
                className={styles.searchForm__stepperBtn}
                onClick={() => setAdults(Math.max(1, adults - 1))}
                disabled={adults <= 1}
                aria-label="Decrease adults"
                data-testid="adults-decrement"
              >
                −
              </button>
              <span className={styles.searchForm__stepperValue} aria-live="polite">
                {adults}
              </span>
              <button
                type="button"
                className={styles.searchForm__stepperBtn}
                onClick={() => setAdults(Math.min(20, adults + 1))}
                disabled={adults >= 20}
                aria-label="Increase adults"
                data-testid="adults-increment"
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div className={styles.searchForm__travellerRow}>
            <span className={styles.searchForm__travellerLabel}>Children <span className={styles.searchForm__travellerHint}>(0–11 years)</span></span>
            <div className={styles.searchForm__stepper}>
              <button
                type="button"
                className={styles.searchForm__stepperBtn}
                onClick={removeChild}
                disabled={children.length === 0}
                aria-label="Decrease children"
                data-testid="children-decrement"
              >
                −
              </button>
              <span className={styles.searchForm__stepperValue} aria-live="polite">
                {children.length}
              </span>
              <button
                type="button"
                className={styles.searchForm__stepperBtn}
                onClick={addChild}
                disabled={children.length >= MAX_CHILDREN}
                aria-label="Increase children"
                data-testid="children-increment"
              >
                +
              </button>
            </div>
          </div>

          {/* Child age inputs */}
          {children.length > 0 && (
            <div className={styles.searchForm__childAges}>
              <p className={styles.searchForm__childAgesHint}>
                Please enter ages for all children. Infants (under 2) typically travel on a parent lap.
              </p>
              {children.map((child, index) => (
                <div key={index} className={styles.searchForm__childAgeRow}>
                  <label className={styles.searchForm__childAgeLabel} htmlFor={`child-age-${index}`}>
                    {getChildLabel(child.age)}
                  </label>
                  <select
                    id={`child-age-${index}`}
                    value={child.age}
                    onChange={(e) => updateChildAge(index, parseInt(e.target.value))}
                    className={styles.searchForm__childAgeSelect}
                    aria-label={`Child ${index + 1} age`}
                    data-testid={`child-age-${index}`}
                  >
                    {Array.from({ length: MAX_CHILD_AGE + 1 }, (_, i) => i).map((age) => (
                      <option key={age} value={age}>
                        {age === 0 ? '0 - Infant' : age === 1 ? '1 - Infant' : `${age} - Child`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Traveller summary */}
          <div className={styles.searchForm__travellerSummary} aria-live="polite">
            {travellerSummary()}
          </div>
        </div>

        {/* Step 3: Hotel preference */}
        <div className={styles.searchForm__section}>
          <div className={styles.searchForm__sectionHeader}>
            <span className={styles.searchForm__stepNumber}>3</span>
            <label className={styles.searchForm__label}>
              Hotel star rating
            </label>
          </div>
          <div className={styles.searchForm__chipGroup} role="radiogroup" aria-label="Hotel star rating preference">
            {starsOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                role="radio"
                aria-checked={hotelStars === opt.value}
                className={`${styles.searchForm__chip} ${hotelStars === opt.value ? styles.searchForm__chipActive : ''}`}
                onClick={() => setHotelStars(opt.value)}
                data-testid={`hotel-stars-${opt.label.replace(/[^a-z0-9]/gi, '').toLowerCase()}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Budget */}
        <div className={styles.searchForm__section}>
          <div className={styles.searchForm__sectionHeader}>
            <span className={styles.searchForm__stepNumber}>4</span>
            <label className={styles.searchForm__label}>
              Budget per person
            </label>
          </div>
          <label className={styles.searchForm__toggle}>
            <input
              type="checkbox"
              checked={budgetEnabled}
              onChange={(e) => setBudgetEnabled(e.target.checked)}
              className={styles.searchForm__toggleInput}
              aria-label="Enable budget filter"
              data-testid="budget-toggle"
            />
            <span className={styles.searchForm__toggleTrack}>
              <span className={styles.searchForm__toggleThumb} />
            </span>
            <span className={styles.searchForm__toggleLabel}>
              {budgetEnabled ? 'Set budget range' : 'No budget limit'}
            </span>
          </label>

          {budgetEnabled && (
            <div className={styles.searchForm__budgetSection}>
              <div className={styles.searchForm__selectedBudget}>
                £{minBudget.toLocaleString('en-GB')} - £{maxBudget.toLocaleString('en-GB')} <span className={styles.searchForm__budgetUnit}>per person</span>
              </div>
              <div className={styles.searchForm__budgetSliderContainer}>
                <div className={styles.searchForm__track}>
                  <div
                    className={styles.searchForm__activeTrack}
                    style={{ left: `${budgetRangeStart}%`, width: `${budgetRangeWidth}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={minBudgetValue}
                  max={maxBudgetValue}
                  step="50"
                  value={budgetRange[0]}
                  onChange={(e) => handleBudgetRangeChange(0, parseInt(e.target.value))}
                  className={styles.searchForm__budgetSlider}
                  aria-label="Minimum budget"
                  data-testid="budget-min-slider"
                />
                <input
                  type="range"
                  min={minBudgetValue}
                  max={maxBudgetValue}
                  step="50"
                  value={budgetRange[1]}
                  onChange={(e) => handleBudgetRangeChange(1, parseInt(e.target.value))}
                  className={styles.searchForm__budgetSlider}
                  aria-label="Maximum budget"
                  data-testid="budget-max-slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={styles.searchForm__searchButton}
          aria-label="Find Umrah packages matching your preferences"
          data-testid="find-packages-submit"
        >
          Find Packages
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Trust / Disclaimer */}
        <div className={styles.searchForm__trustRow}>
          <div className={styles.searchForm__trustItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Verified Operators
          </div>
          <div className={styles.searchForm__trustItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            ATOL Protected
          </div>
          <div className={styles.searchForm__trustItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Transparent Pricing
          </div>
        </div>

        <p className={styles.searchForm__disclaimer}>
          Currently available for travellers in the United Kingdom
        </p>
      </form>
    </div>
  )
}