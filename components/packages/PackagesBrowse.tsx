'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import type { Package, OperatorProfile } from '@/lib/types'
import { NEUTRAL_SORT_DISCLOSURE } from '@/lib/content-rules'
import { mapPackageToComparison, handleComparisonSelection } from '@/lib/comparison'
import { toSearchDisplay } from '@/components/search/search-utils'
import PackageCard from '@/components/search/PackageCard'
import CompareBar, { type CompareBarItem } from '@/components/search/CompareBar'
import { ComparisonTable } from '@/components/request/ComparisonTable'
import {
  Dialog,
  OverlayBody,
  OverlayContent,
  OverlayDescription,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay'
import styles from './packagesBrowse.module.css'

type PilgrimageFilter = 'all' | 'umrah' | 'hajj'
type SortOption = 'relevance' | 'price-asc' | 'price-desc'

const SHORTLIST_STORAGE_KEY = 'kb_shortlist_packages'
const COMPARE_MIN = 2
const COMPARE_MAX = 3
const uniqueIds = (ids: string[]) => Array.from(new Set(ids))

interface PackagesBrowseProps {
  packages: Package[]
  error?: string
}

const TYPE_TABS: { value: PilgrimageFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'umrah', label: 'Umrah' },
  { value: 'hajj', label: 'Hajj' },
]

const buildInclusions = (pkg: Package) =>
  [
    { label: 'Visa', included: pkg.inclusions?.visa ?? false },
    { label: 'Flights', included: pkg.inclusions?.flights ?? false },
    { label: 'Transfers', included: pkg.inclusions?.transfers ?? false },
    { label: 'Meals', included: pkg.inclusions?.meals ?? false },
  ].filter((chip) => chip.included)

export function PackagesBrowse({ packages, error }: PackagesBrowseProps) {
  const [pilgrimageType, setPilgrimageType] = useState<PilgrimageFilter>('all')
  const [seasonLabel, setSeasonLabel] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [isPending, startTransition] = useTransition()
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([])
  const [shortlistedPackages, setShortlistedPackages] = useState<string[]>([])
  const [shortlistOnly, setShortlistOnly] = useState(false)
  const [shortlistLoaded, setShortlistLoaded] = useState(false)
  const [operatorsById, setOperatorsById] = useState<Record<string, OperatorProfile>>({})
  const [showComparison, setShowComparison] = useState(false)
  const [compareMessage, setCompareMessage] = useState<string>('')

  useEffect(() => {
    fetch('/api/operators')
      .then((r) => r.json())
      .then((d) => {
        if (d.operators) {
          setOperatorsById(
            (d.operators as OperatorProfile[]).reduce<Record<string, OperatorProfile>>(
              (acc, op) => { acc[op.id] = op; return acc },
              {}
            )
          )
        }
      })
      .catch(() => { /* operator trust signals just won't render */ })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(SHORTLIST_STORAGE_KEY)
      const parsed = stored ? (JSON.parse(stored) as string[]) : []
      setShortlistedPackages(Array.isArray(parsed) ? uniqueIds(parsed) : [])
    } catch {
      setShortlistedPackages([])
    } finally {
      setShortlistLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!shortlistLoaded || typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        SHORTLIST_STORAGE_KEY,
        JSON.stringify(uniqueIds(shortlistedPackages))
      )
    } catch {
      // Ignore persistence errors (private mode, storage full, etc.)
    }
  }, [shortlistLoaded, shortlistedPackages])

  const seasonOptions = useMemo(() => {
    const labels = packages
      .map((pkg) => pkg.seasonLabel)
      .filter((label): label is string => Boolean(label))
    return Array.from(new Set(labels)).sort()
  }, [packages])

  const filteredPackages = useMemo(() => {
    let next = [...packages]

    if (pilgrimageType !== 'all') {
      next = next.filter((pkg) => pkg.pilgrimageType === pilgrimageType)
    }
    if (seasonLabel !== 'all') {
      next = next.filter((pkg) => pkg.seasonLabel === seasonLabel)
    }
    if (sortBy === 'price-asc') {
      next.sort((a, b) => a.pricePerPerson - b.pricePerPerson)
    } else if (sortBy === 'price-desc') {
      next.sort((a, b) => b.pricePerPerson - a.pricePerPerson)
    }
    if (shortlistOnly) {
      next = next.filter((pkg) => shortlistedPackages.includes(pkg.id))
    }
    return next
  }, [packages, pilgrimageType, seasonLabel, sortBy, shortlistOnly, shortlistedPackages])

  const showShortlistEmpty = shortlistOnly && !error && filteredPackages.length === 0
  const showEmpty = !error && !showShortlistEmpty && filteredPackages.length === 0

  const onToggleShortlist = (packageId: string) => {
    setShortlistedPackages((prev) =>
      uniqueIds(
        prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId]
      )
    )
  }

  const onToggleCompare = (packageId: string) => {
    setCompareMessage('')
    setSelectedCompareIds((prev) => {
      try {
        return handleComparisonSelection(prev, packageId)
      } catch (err) {
        setCompareMessage((err as Error).message)
        return prev
      }
    })
  }

  const compareFull = selectedCompareIds.length >= COMPARE_MAX

  // Map from the full list (not the filtered view) so a selected package never
  // silently drops out of the comparison when filters change.
  const comparisonRows = useMemo(
    () =>
      packages
        .filter((pkg) => selectedCompareIds.includes(pkg.id))
        .map((pkg) => mapPackageToComparison(pkg, operatorsById[pkg.operatorId])),
    [packages, operatorsById, selectedCompareIds]
  )

  const compareItems = useMemo<CompareBarItem[]>(
    () =>
      selectedCompareIds.map((id) => {
        const pkg = packages.find((p) => p.id === id)
        const operator = pkg ? operatorsById[pkg.operatorId] : undefined
        return { id, label: operator?.companyName ?? pkg?.title ?? 'Selected package' }
      }),
    [selectedCompareIds, packages, operatorsById]
  )

  const openComparison = () => {
    // Defer past the current event tick so the dialog's dismissable layer
    // doesn't treat this same click as an "outside" click and re-close it.
    if (selectedCompareIds.length >= COMPARE_MIN) {
      setTimeout(() => setShowComparison(true), 0)
    }
  }

  const resetFilters = () => {
    startTransition(() => {
      setPilgrimageType('all')
      setSeasonLabel('all')
      setSortBy('relevance')
      setShortlistOnly(false)
    })
  }

  return (
    <section
      data-testid="packages-page"
      aria-busy={isPending ? 'true' : 'false'}
      className={`${styles.page} ${compareItems.length > 0 ? styles.gridWithBar : ''}`}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Browse packages</h1>
        <p className={styles.subtitle}>
          Compare published Umrah and Hajj packages from verified UK operators — side by side, no
          cost to you.
        </p>
      </header>

      <div className={styles.toolbar}>
        {/* Primary filter: pilgrimage type as a segmented control */}
        <div className={styles.segment} role="group" aria-label="Filter by pilgrimage type">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              data-testid={`packages-type-${tab.value}`}
              className={`${styles.segmentBtn} ${pilgrimageType === tab.value ? styles.segmentBtnActive : ''}`}
              aria-pressed={pilgrimageType === tab.value}
              onClick={() => startTransition(() => setPilgrimageType(tab.value))}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <div className={styles.count} aria-live="polite">
            <span className={styles.countNumber}>{filteredPackages.length}</span>
            <span className={styles.countLabel}>
              {filteredPackages.length === 1 ? 'package' : 'packages'}
            </span>
          </div>

          {seasonOptions.length > 0 && (
            <div className={styles.field}>
              <label htmlFor="packages-filter-season" className={styles.fieldLabel}>
                Season
              </label>
              <select
                id="packages-filter-season"
                data-testid="packages-filter-season"
                className={styles.select}
                value={seasonLabel}
                onChange={(e) => startTransition(() => setSeasonLabel(e.target.value))}
              >
                <option value="all">All seasons</option>
                {seasonOptions.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="packages-filter-sort" className={styles.fieldLabel}>
              Sort
            </label>
            <select
              id="packages-filter-sort"
              data-testid="packages-filter-price"
              className={styles.select}
              value={sortBy}
              onChange={(e) => startTransition(() => setSortBy(e.target.value as SortOption))}
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>

          <button
            type="button"
            data-testid="shortlist-filter"
            className={`${styles.savedChip} ${shortlistOnly ? styles.savedChipActive : ''}`}
            aria-pressed={shortlistOnly}
            onClick={() => setShortlistOnly((v) => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={shortlistOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span data-testid="shortlist-count">
              Saved ({shortlistedPackages.length})
            </span>
          </button>
        </div>

        <p className={styles.disclosure} data-testid="sort-disclosure">
          {NEUTRAL_SORT_DISCLOSURE}{' '}
          <a href="/how-we-rank" className={styles.disclosureLink}>
            How we rank
          </a>
        </p>
      </div>

      {error ? (
        <div role="alert" className={styles.alert}>
          {error}
        </div>
      ) : null}

      {compareMessage ? (
        <p role="alert" data-testid="compare-message" className={styles.compareMessage}>
          {compareMessage}
        </p>
      ) : null}

      {isPending ? (
        <p role="status" className={styles.statusRow}>
          Updating results…
        </p>
      ) : null}

      {showShortlistEmpty ? (
        <div data-testid="shortlist-empty" className={styles.empty} role="status">
          <p className={styles.emptyTitle}>Nothing saved yet</p>
          <p className={styles.emptyText}>
            Tap <strong>Save</strong> on any package to keep it here for later.
          </p>
          <button type="button" className={styles.emptyAction} onClick={() => setShortlistOnly(false)}>
            Show all packages
          </button>
        </div>
      ) : null}

      {showEmpty ? (
        <div data-testid="packages-empty" className={styles.empty} role="status">
          <p className={styles.emptyTitle}>No packages match these filters</p>
          <p className={styles.emptyText}>
            Try a different pilgrimage type or season — or clear your filters to see everything.
          </p>
          <button type="button" className={styles.emptyAction} onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      ) : null}

      {filteredPackages.length > 0 && (
        <ul className={styles.grid} aria-label="Packages">
          {filteredPackages.map((pkg) => (
            <li key={pkg.id}>
              <PackageCard
                package={toSearchDisplay(pkg)}
                operator={operatorsById[pkg.operatorId]}
                inclusions={buildInclusions(pkg)}
                isShortlisted={shortlistedPackages.includes(pkg.id)}
                isCompareSelected={selectedCompareIds.includes(pkg.id)}
                compareFull={compareFull}
                onAddToShortlist={onToggleShortlist}
                onToggleCompare={onToggleCompare}
                nightsMakkah={pkg.nightsMakkah}
                nightsMadinah={pkg.nightsMadinah}
                priceType={pkg.priceType === 'from' ? 'from' : 'exact'}
              />
            </li>
          ))}
        </ul>
      )}

      <CompareBar
        items={compareItems}
        min={COMPARE_MIN}
        max={COMPARE_MAX}
        onRemove={onToggleCompare}
        onClear={() => { setSelectedCompareIds([]); setCompareMessage('') }}
        onCompare={openComparison}
      />

      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <OverlayContent className="max-h-[min(92dvh,56rem)] w-[min(calc(100vw-1rem),68rem)] sm:w-[min(calc(100vw-2rem),68rem)]">
          <OverlayHeader>
            <OverlayTitle>Compare packages</OverlayTitle>
            <OverlayDescription>
              Review your selected packages side by side across price, operator, hotels, and
              inclusions.
            </OverlayDescription>
          </OverlayHeader>
          <OverlayBody className="p-0">
            <ComparisonTable rows={comparisonRows} />
          </OverlayBody>
        </OverlayContent>
      </Dialog>
    </section>
  )
}
