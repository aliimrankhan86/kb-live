'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Package, OperatorProfile } from '@/lib/types'
import { createQuotePrefillUrl } from '@/lib/quote-prefill'
import { CURRENCY_CHANGE_EVENT, getRegionSettings } from '@/lib/i18n/region'
import { formatPriceForRegion } from '@/lib/i18n/format'
import { buttonVariants } from '@/components/ui/Button'
import { InclusionChipList } from '@/components/ui/InclusionChip'

interface PackageDetailProps {
  pkg: Package
  operator?: OperatorProfile
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

export function PackageDetail({ pkg, operator }: PackageDetailProps) {
  const router = useRouter()
  const [regionSettings, setRegionSettings] = useState(() => getRegionSettings())

  useEffect(() => {
    const updateSettings = () => setRegionSettings(getRegionSettings())
    window.addEventListener(CURRENCY_CHANGE_EVENT, updateSettings)
    return () => window.removeEventListener(CURRENCY_CHANGE_EVENT, updateSettings)
  }, [])

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/packages')
    }
  }

  return (
    <section data-testid="package-detail-page" className="w-full max-w-5xl mx-auto px-4 py-10">
      <nav className="mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--yellow)] hover:text-[var(--yellow)] focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
          aria-label="Go back to previous page"
          data-testid="package-back-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
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
          <InclusionChipList
            chips={[
              { label: 'Visa', included: pkg.inclusions.visa },
              { label: 'Flights', included: pkg.inclusions.flights },
              { label: 'Transfers', included: pkg.inclusions.transfers },
              { label: 'Meals', included: pkg.inclusions.meals },
            ]}
            data-testid="package-inclusion-chips"
          />
        </div>

        {/* ATOL/ABTA Protection Status */}
        <div className="mt-3 flex flex-wrap gap-2" data-testid="operator-protection-status">
          {operator?.atolNumber && (
            <div className="inline-flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm">
              <span aria-hidden="true" className="text-green-400 font-bold">✓</span>
              <span className="text-green-300">ATOL {operator.atolNumber}</span>
            </div>
          )}
          {operator?.abtaMemberNumber && (
            <div className="inline-flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm">
              <span aria-hidden="true" className="text-green-400 font-bold">✓</span>
              <span className="text-green-300">ABTA {operator.abtaMemberNumber}</span>
            </div>
          )}
          {!operator?.atolNumber && !operator?.abtaMemberNumber && (
            <div
              className="inline-flex items-center gap-2 rounded-md border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-1.5 text-sm"
              role="alert"
            >
              <span aria-hidden="true" className="text-[var(--danger)] font-bold">⚠</span>
              <span className="text-[var(--danger)]">
                No ATOL/ABTA protection listed — verify directly with the operator before booking
              </span>
            </div>
          )}
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

      {/* Financial Protection & Liability Disclaimer */}
      <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--textMuted)]">Important — Your Protection</h2>
        <div className="mt-3 space-y-2 text-sm text-[var(--textMuted)]">
          <p>
            This package is sold by <strong className="text-[var(--text)]">{operator?.companyName ?? 'the travel operator'}</strong>, not by KaabaTrip.
          </p>
          {operator?.atolNumber ? (
            <p>
              <span className="text-green-400 font-bold">✓</span> This operator lists ATOL protection ({operator.atolNumber}).
              You should receive an ATOL certificate with your booking confirmation.
            </p>
          ) : null}
          {operator?.abtaMemberNumber ? (
            <p>
              <span className="text-green-400 font-bold">✓</span> This operator lists ABTA membership ({operator.abtaMemberNumber}).
              ABTA provides dispute resolution and booking protection.
            </p>
          ) : null}
          {!operator?.atolNumber && !operator?.abtaMemberNumber ? (
            <p className="text-[var(--danger)]">
              <span className="font-bold">⚠</span> This operator does not list ATOL or ABTA protection.
              You should ask the operator directly what financial protection they provide before paying any deposit or full amount.
            </p>
          ) : null}
          <p className="mt-2 text-xs">
            KaabaTrip is a comparison platform. We do not verify ATOL/ABTA credentials and are not responsible for the operator{'\''}s financial protection status.
            Your contract is directly with the operator. Always confirm protection details in writing before paying.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-[var(--border)] px-5 py-4">
        <p className="text-sm text-[var(--textMuted)]">
          Prices and availability are indicative. Final confirmation is provided by the travel operator.
        </p>
      </section>

      {/* Desktop CTA */}
      <div className="mt-6 hidden md:block">
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

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg)] p-4 md:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--textMuted)]">{pkg.priceType === 'from' ? 'From' : 'Price'}</p>
            <p className="text-lg font-semibold text-[var(--text)]">{formatPrice(pkg, regionSettings)}</p>
          </div>
          <Link
            href={createQuotePrefillUrl(pkg)}
            data-testid="package-mobile-cta-request-quote"
            className={buttonVariants({
              variant: 'primary',
              size: 'md',
              className: 'px-5 whitespace-nowrap',
            })}
          >
            Request quote
          </Link>
        </div>
      </div>
    </section>
  )
}
