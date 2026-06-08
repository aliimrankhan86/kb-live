'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { RangeSlider } from '@/components/ui/RangeSlider'
import styles from './umrah-search-form.module.css'

interface ChildInfo {
  age: number
}

interface UmrahSearchFormProps {
  className?: string
}

const TARGET_CITIES = [
  { code: 'LON', name: 'London', helper: 'Any London airport' },
  { code: 'BHX', name: 'Birmingham', helper: 'Birmingham area' },
  { code: 'MAN', name: 'Manchester', helper: 'Manchester area' },
] as const

type TargetCityCode = typeof TARGET_CITIES[number]['code']
type TravelTimingMode = 'exact' | 'period'
const DEFAULT_CITY: TargetCityCode = 'LON'

// Generate dates relative to today for sensible defaults
const today = new Date()
const currentYear = today.getFullYear()

// Default departure: today
const defaultDeparture = new Date(today.getFullYear(), today.getMonth(), today.getDate())
// Default return: 14 days after departure
const defaultReturn = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)

const formatISODate = (d: Date) => d.toISOString().split('T')[0]

const parseInputDate = (v: string) => {
  const [y, m, d] = v.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const UmrahSearchForm: React.FC<UmrahSearchFormProps> = ({ className = '' }) => {
  const [departureAirport, setDepartureAirport] = useState<TargetCityCode | ''>(DEFAULT_CITY)
  const [returnAirport, setReturnAirport] = useState<TargetCityCode | ''>(DEFAULT_CITY)
  const [departureDate, setDepartureDate] = useState(formatISODate(defaultDeparture))
  const [returnDate, setReturnDate] = useState(formatISODate(defaultReturn))
  const [travelTimingMode, setTravelTimingMode] = useState<TravelTimingMode>('exact')
  const [selectedQuickPick, setSelectedQuickPick] = useState<string>('')
  const [budgetEnabled, setBudgetEnabled] = useState(true)
  const [budgetRange, setBudgetRange] = useState([500, 1000])
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState<ChildInfo[]>([])
  const [hotelStars, setHotelStars] = useState<number[]>([])

  const minBudgetValue = 300
  const maxBudgetValue = 2000
  const minBudget = Math.min(budgetRange[0], budgetRange[1])
  const maxBudget = Math.max(budgetRange[0], budgetRange[1])
  const nextYear = currentYear + 1

  const flexiblePeriodOptions = useMemo(() => [
    {
      id: 'christmas',
      label: 'Christmas school holidays',
      helper: `Approx. 20 Dec ${currentYear} - 5 Jan ${nextYear}`,
      season: 'school-holidays',
      getDates: () => ({ start: `${currentYear}-12-20`, end: `${nextYear}-01-05` })
    },
    {
      id: 'easter',
      label: 'Easter school holidays',
      helper: `Approx. 20 Mar - 10 Apr ${nextYear}`,
      season: 'school-holidays',
      getDates: () => ({ start: `${nextYear}-03-20`, end: `${nextYear}-04-10` })
    },
    {
      id: 'ramadan',
      label: 'Ramadan Umrah',
      helper: `Approx. May - Jun ${nextYear}`,
      season: 'ramadan',
      getDates: () => ({ start: `${nextYear}-05-01`, end: `${nextYear}-06-15` })
    },
    {
      id: 'summer',
      label: 'Summer school holidays',
      helper: `Approx. Jul - Sep ${nextYear}`,
      season: 'flexible',
      getDates: () => ({ start: `${nextYear}-07-01`, end: `${nextYear}-09-15` })
    }
  ], [nextYear])

  const handleQuickSelect = useCallback((id: string) => {
    const option = flexiblePeriodOptions.find(o => o.id === id)
    if (!option) return
    const dates = option.getDates()
    setDepartureDate(dates.start)
    setReturnDate(dates.end)
    setSelectedQuickPick(id)
  }, [flexiblePeriodOptions])

  const handleDepartureChange = useCallback((v: string) => {
    setDepartureDate(v)
    setSelectedQuickPick('')
    setTravelTimingMode('exact')
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
    setTravelTimingMode('exact')
  }, [])

  const seasonParam = flexiblePeriodOptions.find((o) => o.id === selectedQuickPick)?.season ?? 'flexible'

  const handleBudgetChange = useCallback(([newMin, newMax]: [number, number]) => {
    setBudgetRange([newMin, newMax])
  }, [])

  const starsOptions = [
    { value: 5, label: '5 star', helper: 'Premium hotels' },
    { value: 4, label: '4 star', helper: 'Comfortable hotels' },
    { value: 3, label: '3 star', helper: 'Budget-conscious hotels' },
  ]

  const toggleHotelStars = useCallback((value: number) => {
    setHotelStars((current) =>
      current.includes(value)
        ? current.filter((star) => star !== value)
        : [...current, value].sort((a, b) => b - a)
    )
  }, [])

  const clearHotelStars = useCallback(() => setHotelStars([]), [])

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

  const selectedAirport = TARGET_CITIES.find(a => a.code === departureAirport)
  const selectedReturnAirport = TARGET_CITIES.find(a => a.code === returnAirport)
  const selectedPeriod = flexiblePeriodOptions.find((option) => option.id === selectedQuickPick)
  const tripLengthDays = Math.max(
    0,
    Math.round((parseInputDate(returnDate).getTime() - parseInputDate(departureDate).getTime()) / (1000 * 60 * 60 * 24))
  )
  const routeSummary = `${selectedAirport?.name ?? 'Any target city'} to Jeddah or Madinah, returning to ${selectedReturnAirport?.name ?? 'any target city'}`
  const dateSummary = travelTimingMode === 'period' && selectedPeriod
    ? `${selectedPeriod.label}: ${selectedPeriod.helper}`
    : `${formatDisplayDate(departureDate)} to ${formatDisplayDate(returnDate)}`
  const staySummary = hotelStars.length > 0
    ? `${hotelStars.join(' or ')} star hotels`
    : 'Show all hotel levels'
  const budgetSummary = budgetEnabled
    ? `GBP ${minBudget.toLocaleString('en-GB')} - ${maxBudget.toLocaleString('en-GB')} per person`
    : 'No budget limit'

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
        {departureAirport && <input type="hidden" name="departureAirport" value={departureAirport} />}
        {returnAirport && <input type="hidden" name="returnAirport" value={returnAirport} />}
        {children.length > 0 && (
          <input type="hidden" name="children" value={JSON.stringify(children.map((c) => c.age))} />
        )}
        {hotelStars.length > 0 && <input type="hidden" name="hotelStars" value={hotelStars.join(',')} />}
        {budgetEnabled && (
          <>
            <input type="hidden" name="budgetMin" value={String(minBudget)} />
            <input type="hidden" name="budgetMax" value={String(maxBudget)} />
          </>
        )}

        {/* Header */}
        <div className={styles.searchForm__header}>
          <h1 className={styles.searchForm__title}>
            Compare Umrah packages
          </h1>
          <p className={styles.searchForm__subtitle}>
            Enter the details operators need first: route, dates, travellers, hotel preference and budget.
          </p>
        </div>

        {/* Step 1: Route */}
        <div className={styles.searchForm__section}>
          <div className={styles.searchForm__sectionHeader}>
            <span className={styles.searchForm__stepNumber}>1</span>
            <label htmlFor="departure-airport" className={styles.searchForm__label}>
              Where are you departing from and returning to?
            </label>
          </div>
          <div className={styles.searchForm__routeGrid}>
            <div className={styles.searchForm__airportField}>
              <span className={styles.searchForm__dateLabel}>Departing city</span>
              <select
                id="departure-airport"
                value={departureAirport}
                onChange={(e) => setDepartureAirport(e.target.value as TargetCityCode)}
                className={styles.searchForm__airportSelect}
                aria-label="Departing city"
                data-testid="departure-airport-select"
              >
                <option value="">Any target city</option>
                {TARGET_CITIES.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.searchForm__airportField}>
              <span className={styles.searchForm__dateLabel}>Returning city</span>
              <select
                id="return-airport"
                value={returnAirport}
                onChange={(e) => setReturnAirport(e.target.value as TargetCityCode)}
                className={styles.searchForm__airportSelect}
                aria-label="Returning city"
                data-testid="return-airport-select"
              >
                <option value="">Any target city</option>
                {TARGET_CITIES.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className={styles.searchForm__airportHint} aria-live="polite">
            We currently focus on London, Birmingham and Manchester departures.
          </span>
        </div>

        {/* Step 2: Travel dates */}
        <div className={styles.searchForm__section}>
          <div className={styles.searchForm__sectionHeader}>
            <span className={styles.searchForm__stepNumber}>2</span>
            <label className={styles.searchForm__label}>
              When are you travelling?
            </label>
          </div>

          <p className={styles.searchForm__sectionHelp}>
            Choose exact dates if you know them, or pick a flexible period around UK school holidays or Ramadan.
          </p>

          <div className={styles.searchForm__choiceToggle} role="radiogroup" aria-label="Choose travel timing">
            <button
              type="button"
              role="radio"
              aria-checked={travelTimingMode === 'exact'}
              className={`${styles.searchForm__choiceButton} ${travelTimingMode === 'exact' ? styles.searchForm__choiceButtonActive : ''}`}
              onClick={() => {
                setTravelTimingMode('exact')
                setSelectedQuickPick('')
              }}
              data-testid="travel-mode-exact"
            >
              Exact dates
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={travelTimingMode === 'period'}
              className={`${styles.searchForm__choiceButton} ${travelTimingMode === 'period' ? styles.searchForm__choiceButtonActive : ''}`}
              onClick={() => {
                setTravelTimingMode('period')
                if (!selectedQuickPick) handleQuickSelect('ramadan')
              }}
              data-testid="travel-mode-period"
            >
              Holiday period
            </button>
          </div>

          {travelTimingMode === 'exact' ? (
            <>
              <div className={styles.searchForm__dateInputs}>
                <div className={styles.searchForm__dateField}>
                  <label htmlFor="departure-date" className={styles.searchForm__dateLabel}>
                    Depart
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
              <p className={styles.searchForm__tripLength} aria-live="polite">
                {tripLengthDays > 0 ? `${tripLengthDays} nights selected` : 'Choose a return date after departure'}
              </p>
            </>
          ) : (
            <div className={styles.searchForm__periodGrid}>
              {flexiblePeriodOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleQuickSelect(option.id)}
                  className={`${styles.searchForm__periodButton} ${selectedQuickPick === option.id ? styles.searchForm__periodButtonActive : ''}`}
                  aria-label={`Select ${option.label}`}
                  aria-pressed={selectedQuickPick === option.id}
                  data-testid={`quick-select-${option.id}`}
                >
                  <span className={styles.searchForm__periodTitle}>{option.label}</span>
                  <span className={styles.searchForm__periodHelper}>{option.helper}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Travellers */}
        <div className={styles.searchForm__section}>
          <div className={styles.searchForm__sectionHeader}>
            <span className={styles.searchForm__stepNumber}>3</span>
            <label className={styles.searchForm__label}>
              Travellers
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

        {/* Step 4: Hotel preference */}
        <div className={styles.searchForm__section}>
          <div className={styles.searchForm__sectionHeader}>
            <span className={styles.searchForm__stepNumber}>4</span>
            <label className={styles.searchForm__label}>
              Hotel preference
            </label>
          </div>
          <p className={styles.searchForm__sectionHelp}>
            Choose one or more hotel levels to include. Use Show all if you are open to every option.
          </p>
          <div className={styles.searchForm__chipGroup} role="group" aria-label="Hotel star rating preference">
            <button
              type="button"
              className={`${styles.searchForm__chip} ${hotelStars.length === 0 ? styles.searchForm__chipActive : ''}`}
              onClick={clearHotelStars}
              aria-pressed={hotelStars.length === 0}
              data-testid="hotel-stars-any"
            >
              Show all
            </button>
            {starsOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                aria-pressed={hotelStars.includes(opt.value)}
                className={`${styles.searchForm__chip} ${hotelStars.includes(opt.value) ? styles.searchForm__chipActive : ''}`}
                onClick={() => toggleHotelStars(opt.value)}
                data-testid={`hotel-stars-${opt.label.replace(/[^a-z0-9]/gi, '').toLowerCase()}`}
              >
                <span>{opt.label}</span>
                <span className={styles.searchForm__chipHint}>{opt.helper}</span>
              </button>
            ))}
          </div>
          <p className={styles.searchForm__selectionNote} aria-live="polite">
            {staySummary}
          </p>
        </div>

        {/* Step 5: Budget */}
        <div className={styles.searchForm__section}>
          <div className={styles.searchForm__sectionHeader}>
            <span className={styles.searchForm__stepNumber}>5</span>
            <label className={styles.searchForm__label}>
              Budget
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
                GBP {minBudget.toLocaleString('en-GB')} - {maxBudget.toLocaleString('en-GB')} <span className={styles.searchForm__budgetUnit}>per person</span>
              </div>
              <RangeSlider
                min={minBudgetValue}
                max={maxBudgetValue}
                value={[budgetRange[0], budgetRange[1]]}
                step={50}
                minGap={100}
                onChange={handleBudgetChange}
                ariaLabelMin="Minimum budget"
                ariaLabelMax="Maximum budget"
                data-testid-min="budget-min-slider"
                data-testid-max="budget-max-slider"
              />
            </div>
          )}
        </div>

        <section className={styles.searchForm__summary} aria-label="Selected search details" data-testid="umrah-search-summary">
          <div>
            <p className={styles.searchForm__summaryLabel}>Route</p>
            <p className={styles.searchForm__summaryValue}>{routeSummary}</p>
          </div>
          <div>
            <p className={styles.searchForm__summaryLabel}>Dates</p>
            <p className={styles.searchForm__summaryValue}>{dateSummary}</p>
          </div>
          <div>
            <p className={styles.searchForm__summaryLabel}>Travellers</p>
            <p className={styles.searchForm__summaryValue}>{travellerSummary()}</p>
          </div>
          <div>
            <p className={styles.searchForm__summaryLabel}>Stay and budget</p>
            <p className={styles.searchForm__summaryValue}>{staySummary}; {budgetSummary}</p>
          </div>
        </section>

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
              <path d="M4 4h16v16H4z" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
            Clear prices
          </div>
        </div>
      </form>
    </div>
  )
}
