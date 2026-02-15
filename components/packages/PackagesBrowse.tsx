'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, useTransition } from 'react'
import type { Package, OperatorProfile } from '@/lib/types'
import { MockDB } from '@/lib/api/mock-db'
import { mapPackageToComparison, handleComparisonSelection } from '@/lib/comparison'
import { ComparisonTable } from '@/components/request/ComparisonTable'
import { getRegionSettings } from '@/lib/i18n/region'
import { formatPriceForRegion } from '@/lib/i18n/format'
import {
  Dialog,
  OverlayContent,
  OverlayHeader,
  OverlayTitle,
} from '@/components/ui/Overlay'

type PilgrimageFilter = 'all' | 'umrah' | 'hajj'
type PriceSort = 'none' | 'price-asc' | 'price-desc'
const SHORTLIST_STORAGE_KEY = 'kb_shortlist_packages'
const uniqueIds = (ids: string[]) => Array.from(new Set(ids))

interface PackagesBrowseProps {
  packages: Package[]
  error?: string
}

const formatSeasonLabel = (pkg: Package) => pkg.seasonLabel ?? 'Flexible'

export function PackagesBrowse({ packages, error }: PackagesBrowseProps) {
  const [pilgrimageType, setPilgrimageType] = useState<PilgrimageFilter>('all')
  const [seasonLabel, setSeasonLabel] = useState<string>('all')
  const [priceSort, setPriceSort] = useState<PriceSort>('none')
  const [isPending, startTransition] = useTransition()
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const [shortlistedPackages, setShortlistedPackages] = useState<string[]>([])
  const [shortlistOnly, setShortlistOnly] = useState(false)
  const [shortlistLoaded, setShortlistLoaded] = useState(false)
  const [operatorsById, setOperatorsById] = useState<Record<string, OperatorProfile>>({})
  const [showComparison, setShowComparison] = useState(false)
  const [compareMessage, setCompareMessage] = useState<string>('')

  useEffect(() => {
    const ops = MockDB.getOperators()
    const map = ops.reduce<Record<string, OperatorProfile>>((acc, op) => {
      acc[op.id] = op
      return acc
    }, {})
    setOperatorsById(map)
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

  const regionSettings = useMemo(() => getRegionSettings(), [])

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

    if (priceSort === 'price-asc') {
      next.sort((a, b) => a.pricePerPerson - b.pricePerPerson)
    }

    if (priceSort === 'price-desc') {
      next.sort((a, b) => b.pricePerPerson - a.pricePerPerson)
    }

    if (shortlistOnly) {
      next = next.filter((pkg) => shortlistedPackages.includes(pkg.id))
    }

    return next
  }, [packages, pilgrimageType, priceSort, seasonLabel, shortlistOnly, shortlistedPackages])

  const showEmpty = !error && filteredPackages.length === 0
  const showShortlistEmpty = shortlistOnly && !error && filteredPackages.length === 0
  const compareDisabled = selectedPackages.length < 2
  const formatPrice = (pkg: Package) => {
    const priceInfo = formatPriceForRegion(pkg.pricePerPerson, pkg.currency, regionSettings)
    return pkg.priceType === 'from' ? `From ${priceInfo.formatted}` : priceInfo.formatted
  }
  const comparisonRows = useMemo(
    () =>
      filteredPackages
        .filter((pkg) => selectedPackages.includes(pkg.id))
        .map((pkg) => mapPackageToComparison(pkg, operatorsById[pkg.operatorId])),
    [filteredPackages, operatorsById, selectedPackages]
  )

  return (
    <section
      data-testid="packages-page"
      aria-busy={isPending ? 'true' : 'false'}
      className="w-full max-w-6xl mx-auto px-4 py-10"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--text)]">Browse Packages</h1>
        <p className="mt-2 text-[var(--textMuted)]">
          Compare published Umrah and Hajj packages from verified operators.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="packages-filter-type" className="text-sm font-medium text-[var(--text)]">
            Pilgrimage type
          </label>
          <select
            id="packages-filter-type"
            data-testid="packages-filter-type"
            value={pilgrimageType}
            onChange={(event) =>
              startTransition(() => setPilgrimageType(event.target.value as PilgrimageFilter))
            }
            className="rounded border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="umrah">Umrah</option>
            <option value="hajj">Hajj</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="packages-filter-season" className="text-sm font-medium text-[var(--text)]">
            Season
          </label>
          <select
            id="packages-filter-season"
            value={seasonLabel}
            onChange={(event) => startTransition(() => setSeasonLabel(event.target.value))}
            className="rounded border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm"
            disabled={seasonOptions.length === 0}
          >
            <option value="all">All seasons</option>
            {seasonOptions.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="packages-filter-price" className="text-sm font-medium text-[var(--text)]">
            Price sort
          </label>
          <select
            id="packages-filter-price"
            value={priceSort}
            onChange={(event) =>
              startTransition(() => setPriceSort(event.target.value as PriceSort))
            }
            className="rounded border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm"
          >
            <option value="none">No sorting</option>
            <option value="price-asc">Lowest to highest</option>
            <option value="price-desc">Highest to lowest</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--text)]">Shortlist</span>
          <label className="flex items-center gap-2 text-sm text-[var(--textMuted)]">
            <input
              type="checkbox"
              data-testid="shortlist-filter"
              checked={shortlistOnly}
              onChange={(event) => setShortlistOnly(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] bg-[var(--panel)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            Show shortlist only
          </label>
          <div
            data-testid="shortlist-count"
            className="text-xs font-medium text-[var(--textMuted)]"
          >
            {shortlistedPackages.length} shortlisted
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-2">
        <button
          type="button"
          data-testid="packages-compare-button"
          onClick={() => setShowComparison(true)}
          disabled={compareDisabled}
          aria-disabled={compareDisabled ? 'true' : 'false'}
          aria-describedby={compareDisabled ? 'packages-compare-help' : undefined}
          className="rounded bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Compare ({selectedPackages.length})
        </button>
        {compareDisabled ? (
          <p id="packages-compare-help" className="text-xs text-[var(--textMuted)]">
            Select at least 2 packages to compare
          </p>
        ) : null}
        {compareMessage ? (
          <div
            role="alert"
            data-testid="compare-message"
            className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
          >
            {compareMessage}
          </div>
        ) : null}
      </div>

      {error ? (
        <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-100">{error}</p>
        </div>
      ) : null}

      {isPending ? (
        <div role="status" className="mt-4 text-sm text-[var(--textMuted)]">
          Updating package results...
        </div>
      ) : null}

      {showShortlistEmpty ? (
        <div
          data-testid="shortlist-empty"
          className="mt-6 rounded border border-dashed border-[var(--border)] px-4 py-6 text-center"
        >
          <p className="text-sm text-[var(--textMuted)]">
            No packages in your shortlist yet. Add some to see them here.
          </p>
        </div>
      ) : null}

      {showEmpty && !showShortlistEmpty ? (
        <div
          data-testid="packages-empty"
          className="mt-6 rounded border border-dashed border-[var(--border)] px-4 py-6 text-center"
        >
          <p className="text-sm text-[var(--textMuted)]">
            No packages match these filters yet. Try clearing a filter or check back soon.
          </p>
        </div>
      ) : null}

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {filteredPackages.map((pkg) => (
          <li
            key={pkg.id}
            data-testid={`package-card-${pkg.id}`}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--textMuted)]">
                  {pkg.pilgrimageType} · {formatSeasonLabel(pkg)}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">
                  <Link
                    href={`/packages/${pkg.slug}`}
                    data-testid={`package-link-${pkg.slug}`}
                    className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    {pkg.title}
                  </Link>
                </h2>
              </div>
              <p className="text-lg font-semibold text-[var(--text)]">{formatPrice(pkg)}</p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-[var(--textMuted)]">
              <div>
                <dt className="font-medium text-[var(--text)]">Total nights</dt>
                <dd>{pkg.totalNights}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--text)]">Nights split</dt>
                <dd>
                  {pkg.nightsMakkah} Makkah · {pkg.nightsMadinah} Madinah
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center gap-4 text-sm text-[var(--textMuted)]">
              <input
                id={`package-compare-${pkg.id}`}
                type="checkbox"
                data-testid={`package-compare-checkbox-${pkg.id}`}
                checked={selectedPackages.includes(pkg.id)}
                onChange={() => {
                  try {
                    const next = handleComparisonSelection(selectedPackages, pkg.id)
                    setSelectedPackages(next)
                    setCompareMessage('')
                  } catch (err) {
                    setCompareMessage((err as Error).message)
                  }
                }}
                className="h-4 w-4 rounded border-[var(--border)] bg-[var(--panel)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <label htmlFor={`package-compare-${pkg.id}`} className="cursor-pointer">
                Compare
              </label>
              <button
                type="button"
                data-testid={`shortlist-toggle-${pkg.id}`}
                onClick={() => {
                  setShortlistedPackages((prev) => {
                    const next = prev.includes(pkg.id)
                      ? prev.filter((id) => id !== pkg.id)
                      : [...prev, pkg.id]
                    return uniqueIds(next)
                  })
                }}
                aria-pressed={shortlistedPackages.includes(pkg.id)}
                className="rounded border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--text)] hover:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                {shortlistedPackages.includes(pkg.id) ? 'Shortlisted' : 'Shortlist'}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <OverlayContent className="max-w-4xl overflow-x-auto">
          <OverlayHeader>
            <OverlayTitle>Compare Packages</OverlayTitle>
          </OverlayHeader>
          <div className="mt-4">
            <ComparisonTable rows={comparisonRows} />
          </div>
        </OverlayContent>
      </Dialog>
    </section>
  )
}
