'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Package } from '@/lib/types'
import { createQuotePrefillUrl } from '@/lib/quote-prefill'
import { CURRENCY_CHANGE_EVENT, getRegionSettings } from '@/lib/i18n/region'
import { formatPriceForRegion } from '@/lib/i18n/format'
import { buttonVariants } from '@/components/ui/Button'

interface PackageDetailProps {
  pkg: Package
}

const formatPrice = (pkg: Package, settings = getRegionSettings()) => {
  const priceInfo = formatPriceForRegion(pkg.pricePerPerson, pkg.currency, settings)
  return pkg.priceType === 'from' ? `From ${priceInfo.formatted}` : priceInfo.formatted
}

const formatDateWindow = (pkg: Package) => {
  if (!pkg.dateWindow) return 'Flexible'
  return `${pkg.dateWindow.start} to ${pkg.dateWindow.end}`
}

const renderBoolean = (value: boolean) => (value ? 'Included' : 'Not included')

export function PackageDetail({ pkg }: PackageDetailProps) {
  const [regionSettings, setRegionSettings] = useState(() => getRegionSettings())

  useEffect(() => {
    const updateSettings = () => setRegionSettings(getRegionSettings())
    window.addEventListener(CURRENCY_CHANGE_EVENT, updateSettings)
    return () => window.removeEventListener(CURRENCY_CHANGE_EVENT, updateSettings)
  }, [])

  return (
    <section data-testid="package-detail-page" className="w-full max-w-5xl mx-auto px-4 py-10">
      <nav className="text-sm text-[var(--textMuted)] mb-6">
        <Link href="/packages" className="hover:underline">
          Back to packages
        </Link>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-[var(--textMuted)]">
          {pkg.pilgrimageType} · {pkg.seasonLabel ?? 'Flexible'}
        </p>
        <h1 data-testid="package-title" className="mt-2 text-3xl font-semibold text-[var(--text)]">
          {pkg.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p data-testid="package-price" className="text-2xl font-semibold text-[var(--text)]">
            {formatPrice(pkg, regionSettings)}
          </p>
          <span className="text-sm text-[var(--textMuted)]">
            Operator ID: {pkg.operatorId}
          </span>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text)]">Trip details</h2>
          <dl className="mt-4 grid gap-3 text-sm text-[var(--textMuted)]">
            <div>
              <dt className="font-medium text-[var(--text)]">Date window</dt>
              <dd>{formatDateWindow(pkg)}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text)]">Total nights</dt>
              <dd>{pkg.totalNights}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text)]">Nights in Makkah</dt>
              <dd>{pkg.nightsMakkah}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text)]">Nights in Madinah</dt>
              <dd>{pkg.nightsMadinah}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text)]">Hotel details</h2>
          <dl className="mt-4 grid gap-3 text-sm text-[var(--textMuted)]">
            <div>
              <dt className="font-medium text-[var(--text)]">Makkah hotel stars</dt>
              <dd>{pkg.hotelMakkahStars ?? 'Not provided'}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text)]">Madinah hotel stars</dt>
              <dd>{pkg.hotelMadinahStars ?? 'Not provided'}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text)]">Distance to Haram (Makkah)</dt>
              <dd>{pkg.distanceBandMakkah}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--text)]">Distance to Haram (Madinah)</dt>
              <dd>{pkg.distanceBandMadinah}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold text-[var(--text)]">Inclusions</h2>
        <ul data-testid="package-inclusions" className="mt-4 grid gap-2 text-sm text-[var(--textMuted)]">
          <li>Visa: {renderBoolean(pkg.inclusions.visa)}</li>
          <li>Flights: {renderBoolean(pkg.inclusions.flights)}</li>
          <li>Transfers: {renderBoolean(pkg.inclusions.transfers)}</li>
          <li>Meals: {renderBoolean(pkg.inclusions.meals)}</li>
        </ul>
      </section>

      {pkg.notes ? (
        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text)]">Operator notes</h2>
          <p className="mt-3 text-sm text-[var(--textMuted)]">{pkg.notes}</p>
        </section>
      ) : null}

      <section className="mt-8 rounded-lg border border-dashed border-[var(--border)] px-5 py-4">
        <p className="text-sm text-[var(--textMuted)]">
          Prices and availability are indicative. Final confirmation is provided by the travel operator.
        </p>
      </section>

      <div className="mt-6">
        <Link
          href={createQuotePrefillUrl(pkg)}
          data-testid="package-cta-request-quote"
          className={buttonVariants({
            variant: 'primary',
            size: 'md',
            className: 'px-5',
          })}
        >
          Request quote
        </Link>
      </div>
    </section>
  )
}
