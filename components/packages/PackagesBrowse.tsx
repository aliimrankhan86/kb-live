'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import type { Package } from '@/lib/types'

type PilgrimageFilter = 'all' | 'umrah' | 'hajj'
type PriceSort = 'none' | 'price-asc' | 'price-desc'

interface PackagesBrowseProps {
  packages: Package[]
  error?: string
}

const formatPrice = (pkg: Package) => {
  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: pkg.currency,
    maximumFractionDigits: 0,
  }).format(pkg.pricePerPerson)

  return pkg.priceType === 'from' ? `From ${amount}` : amount
}

const formatSeasonLabel = (pkg: Package) => pkg.seasonLabel ?? 'Flexible'

export function PackagesBrowse({ packages, error }: PackagesBrowseProps) {
  const [pilgrimageType, setPilgrimageType] = useState<PilgrimageFilter>('all')
  const [seasonLabel, setSeasonLabel] = useState<string>('all')
  const [priceSort, setPriceSort] = useState<PriceSort>('none')
  const [isPending, startTransition] = useTransition()

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

    return next
  }, [packages, pilgrimageType, priceSort, seasonLabel])

  const showEmpty = !error && filteredPackages.length === 0

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

      {showEmpty ? (
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
          </li>
        ))}
      </ul>
    </section>
  )
}
