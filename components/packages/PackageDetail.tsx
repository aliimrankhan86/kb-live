'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import type { Package, OperatorProfile } from '@/lib/types'
import { createQuotePrefillUrl } from '@/lib/quote-prefill'
import { CURRENCY_CHANGE_EVENT, getRegionSettings } from '@/lib/i18n/region'
import { formatPriceForRegion } from '@/lib/i18n/format'
import { buttonVariants } from '@/components/ui/Button'
import { TierExplanation } from '@/components/operators/TierExplanation'
import {
  INCLUSIONS,
  friendlyDistance,
  flightTypeLabel,
  groupTypeLabel,
  roomOptionsLabel,
} from '@/lib/packages/display'

interface PackageDetailProps {
  pkg: Package
  operator?: OperatorProfile
}

const formatPrice = (value: number, currency: string, settings = getRegionSettings()) =>
  formatPriceForRegion(value, currency, settings).formatted

const Stars = ({ rating }: { rating?: number }) => {
  if (!rating) return <span className="text-[var(--textMuted)]">Rating not provided</span>
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`${rating} out of 5 stars`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" className={i <= rating ? 'fill-[var(--yellow)]' : 'fill-[rgba(255,255,255,0.2)]'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>
      <span className="text-sm text-[var(--textMuted)]">{rating}/5</span>
    </span>
  )
}

const SectionCard = ({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) => (
  <section className={`rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 ${className}`}>
    <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
    {children}
  </section>
)

export function PackageDetail({ pkg, operator }: PackageDetailProps) {
  const router = useRouter()
  const [regionSettings, setRegionSettings] = useState(() => getRegionSettings())

  useEffect(() => {
    const updateSettings = () => setRegionSettings(getRegionSettings())
    window.addEventListener(CURRENCY_CHANGE_EVENT, updateSettings)
    return () => window.removeEventListener(CURRENCY_CHANGE_EVENT, updateSettings)
  }, [])

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/packages')
  }

  const priceLabel = pkg.priceType === 'from' ? `From ${formatPrice(pkg.pricePerPerson, pkg.currency, regionSettings)}` : formatPrice(pkg.pricePerPerson, pkg.currency, regionSettings)
  const makkahDist = friendlyDistance('Makkah', pkg.distanceToHaramMakkahMetres, pkg.distanceBandMakkah)
  const madinahDist = friendlyDistance('Madinah', pkg.distanceToHaramMadinahMetres, pkg.distanceBandMadinah)
  const flight = flightTypeLabel(pkg.flightType)
  const group = groupTypeLabel(pkg.groupType)
  const hasProtection = Boolean(operator?.atolNumber || operator?.abtaMemberNumber)
  const quoteUrl = createQuotePrefillUrl(pkg)

  // "Good to know" (Tier 2) only renders when the operator actually gave us
  // something for it — sparse listings stay short, rich ones get richer.
  const roomLabel = roomOptionsLabel(pkg.roomOccupancyOptions)
  const hasGoodToKnow = roomLabel !== 'Not provided' || Boolean(group) || Boolean(pkg.notes)

  return (
    <section data-testid="package-detail-page" className="w-full max-w-6xl mx-auto px-4 py-8 pb-28 md:pb-10">
      <nav className="mb-5">
        <button
          onClick={handleBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-4 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--yellow)] hover:text-[var(--yellow)] focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2"
          aria-label="Go back to previous page"
          data-testid="package-back-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to results
        </button>
      </nav>

      {/* Title block */}
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-[var(--textMuted)]">
          {pkg.pilgrimageType} · {pkg.seasonLabel ?? 'Flexible dates'}
        </p>
        <h1 data-testid="package-title" className="mt-1.5 text-2xl font-semibold leading-tight text-[var(--text)] md:text-3xl">
          {pkg.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          Sold by <span className="font-medium text-[var(--text)]">{operator?.companyName ?? 'the travel operator'}</span>
          {operator?.verificationStatus === 'verified' && (
            <span className="ml-2 inline-flex items-center gap-1 text-[var(--yellow)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.7l5.4-.8z" /></svg>
              Verified operator
            </span>
          )}
        </p>

        {/* Highlights / benefits — only when the operator listed them */}
        {pkg.highlights && pkg.highlights.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" data-testid="package-highlights" aria-label="Package highlights">
            {pkg.highlights.map((h) => (
              <li key={h} className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,211,29,0.3)] bg-[rgba(255,211,29,0.08)] px-3 py-1.5 text-sm font-medium text-[var(--text)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="3" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                {h}
              </li>
            ))}
          </ul>
        )}
      </header>

      {pkg.images && pkg.images.length > 0 && (
        <section className="mb-6" data-testid="package-image-gallery" aria-label="Package images">
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pkg.images[0]} alt={`${pkg.title} — cover`} className="aspect-[16/7] w-full object-cover" data-testid="package-image-primary" />
          </div>
        </section>
      )}

      {/* Two-column on desktop: detail (left) + sticky decision rail (right) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="grid gap-5">
          {/* What's included / not included — the core decision block */}
          <SectionCard title="What's included">
            <ul data-testid="package-inclusions" className="mt-3 grid gap-3 sm:grid-cols-2">
              {INCLUSIONS.map(({ key, label, help }) => {
                const included = pkg.inclusions[key]
                return (
                  <li key={key} className="flex gap-2.5">
                    <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${included ? 'bg-green-500/15 text-green-400' : 'bg-[rgba(255,255,255,0.06)] text-[var(--textMuted)]'}`} aria-hidden="true">
                      {included ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="text-sm font-medium text-[var(--text)]">
                        {label}: <span className={included ? 'text-green-400' : 'text-[var(--textMuted)]'}>{included ? 'Included' : 'Not included'}</span>
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-[var(--textMuted)]">{help}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-4 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-xs leading-relaxed text-[var(--textMuted)]">
              Anything marked <span className="text-[var(--text)]">Not included</span> you arrange or pay for separately. Always confirm exactly what is and isn&apos;t included, in writing, before paying.
            </p>
          </SectionCard>

          {/* Hotels */}
          <SectionCard title="Your hotels">
            <p className="mt-1 text-xs text-[var(--textMuted)]">How close you stay to the holy sites — a key comfort factor, especially for elderly travellers.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {([
                { city: 'Makkah' as const, name: pkg.hotelMakkahName, stars: pkg.hotelMakkahStars, nights: pkg.nightsMakkah, dist: makkahDist },
                { city: 'Madinah' as const, name: pkg.hotelMadinahName, stars: pkg.hotelMadinahStars, nights: pkg.nightsMadinah, dist: madinahDist },
              ]).map((h) => (
                <div key={h.city} className="rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--textMuted)]">{h.city} · {h.nights} {h.nights === 1 ? 'night' : 'nights'}</p>
                  <p className="mt-1 text-sm font-medium text-[var(--text)]">{h.name ?? 'Hotel name not provided'}</p>
                  <div className="mt-1.5"><Stars rating={h.stars} /></div>
                  {h.dist && (
                    <p className="mt-2 text-sm text-[var(--text)]">
                      {h.dist.primary}
                      {h.dist.note && <span className="block text-xs text-[var(--textMuted)]">{h.dist.note}</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Flights & travel */}
          <SectionCard title="Flights & travel">
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {flight && <Fact term="Flights" value={flight} />}
              {pkg.airline && <Fact term="Airline" value={pkg.airline} />}
              {pkg.departureAirport && <Fact term="Departs from" value={pkg.departureAirport} />}
              <Fact term="Airport transfers" value={pkg.inclusions.transfers ? 'Included' : 'Not included'} />
              <Fact term="Trip length" value={`${pkg.totalNights} nights (${pkg.nightsMakkah} Makkah · ${pkg.nightsMadinah} Madinah)`} />
              {pkg.dateWindow && <Fact term="Travel dates" value={`${pkg.dateWindow.start} – ${pkg.dateWindow.end}`} />}
            </dl>
          </SectionCard>

          {/* Price & payment */}
          <SectionCard title="Price & payment">
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Fact term="Price per person" value={priceLabel} />
              {typeof pkg.depositAmount === 'number' && (
                <Fact term="Deposit to book" value={formatPrice(pkg.depositAmount, pkg.currency, regionSettings)} />
              )}
              {typeof pkg.paymentPlanAvailable === 'boolean' && (
                <Fact term="Pay in instalments" value={pkg.paymentPlanAvailable ? 'Available' : 'Not available'} />
              )}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-[var(--textMuted)]">
              You pay the operator directly. PilgrimCompare does not receive or hold your payment.
            </p>
          </SectionCard>

          {/* Cancellation — decision-critical, so flag its absence */}
          <SectionCard title="Cancellation & changes">
            {pkg.cancellationPolicy ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">{pkg.cancellationPolicy}</p>
            ) : (
              <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-[var(--textMuted)]">
                <span aria-hidden="true" className="text-[var(--danger)]">⚠</span>
                <span>Not provided — ask the operator about cancellation and refunds <strong className="text-[var(--text)]">before paying any deposit.</strong></span>
              </p>
            )}
          </SectionCard>

          {/* Good to know — Tier 2, only when there's something to show */}
          {hasGoodToKnow && (
            <SectionCard title="Good to know">
              <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {roomLabel !== 'Not provided' && <Fact term="Room options" value={roomLabel} hint="Sharing a room (triple/quad) lowers the price per person." />}
                {group && <Fact term="Group type" value={group} />}
              </dl>
              {pkg.notes && (
                <div className="mt-3 border-t border-[var(--border)] pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--textMuted)]">Operator notes</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--textMuted)]">{pkg.notes}</p>
                </div>
              )}
            </SectionCard>
          )}

          {/* Protection */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5" data-testid="operator-protection-status">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--textMuted)]">Your protection</h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--textMuted)]">
              {operator?.atolNumber ? (
                <p>
                  <span className="font-bold text-green-400">✓</span> ATOL {operator.atolNumber}{' '}
                  {operator.atolVerifiedAt
                    ? <span className="text-xs text-green-400" data-testid="atol-verified-badge">(Verified by PilgrimCompare)</span>
                    : <span className="text-xs text-[var(--textMuted)]" data-testid="atol-self-reported">(Self-reported)</span>}
                  {' '}— UK financial protection for flight-inclusive trips. You should receive an ATOL certificate with your confirmation.
                </p>
              ) : null}
              {operator?.abtaMemberNumber ? (
                <p>
                  <span className="font-bold text-green-400">✓</span> ABTA {operator.abtaMemberNumber}{' '}
                  {operator.abtaVerifiedAt
                    ? <span className="text-xs text-green-400" data-testid="abta-verified-badge">(Verified by PilgrimCompare)</span>
                    : <span className="text-xs text-[var(--textMuted)]" data-testid="abta-self-reported">(Self-reported)</span>}
                  {' '}— dispute resolution and booking protection.
                </p>
              ) : null}
              {!hasProtection ? (
                <p className="flex items-start gap-2 text-[var(--danger)]" role="alert">
                  <span className="font-bold">⚠</span>
                  <span>No ATOL or ABTA protection listed. Ask the operator directly what financial protection they provide before paying anything.</span>
                </p>
              ) : null}
              <p className="border-t border-[var(--border)] pt-2 text-xs">
                Your travel contract, cancellations and refunds are with the operator named on this page. PilgrimCompare is a comparison platform and does not verify ATOL/ABTA credentials — always confirm protection in writing before paying.
              </p>
            </div>
          </section>

          {operator?.tier && <TierExplanation tier={operator.tier} />}
        </div>

        {/* Desktop decision rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--textMuted)]">{pkg.priceType === 'from' ? 'From' : 'Price'} · per person</p>
            <p data-testid="package-price" className="mt-1 text-3xl font-bold text-[var(--text)]">{priceLabel}</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--textMuted)]">
              <RailFact label={`${pkg.totalNights} nights`} sub={`${pkg.nightsMakkah} Makkah · ${pkg.nightsMadinah} Madinah`} />
              {(pkg.hotelMakkahStars || pkg.hotelMadinahStars) && (
                <RailFact label="Hotels" sub={`${pkg.hotelMakkahStars ?? '?'}★ Makkah · ${pkg.hotelMadinahStars ?? '?'}★ Madinah`} />
              )}
              {flight && <RailFact label={flight} />}
              {makkahDist && <RailFact label={makkahDist.primary} />}
              <RailFact label={hasProtection ? 'ATOL/ABTA listed' : 'No ATOL/ABTA listed'} tone={hasProtection ? 'good' : 'warn'} />
            </ul>
            <Link href={quoteUrl} data-testid="package-cta-request-quote" className={buttonVariants({ variant: 'primary', size: 'md', className: 'mt-5 w-full' })}>
              Request quote
            </Link>
            <p className="mt-2 text-center text-xs text-[var(--textMuted)]">Free · no payment taken here</p>
          </div>
        </aside>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg)] p-4 lg:hidden" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--textMuted)]">{pkg.priceType === 'from' ? 'From · per person' : 'Per person'}</p>
            <p className="text-lg font-bold text-[var(--text)]">{priceLabel}</p>
          </div>
          <Link href={quoteUrl} data-testid="package-mobile-cta-request-quote" className={buttonVariants({ variant: 'primary', size: 'md', className: 'px-5 whitespace-nowrap' })}>
            Request quote
          </Link>
        </div>
      </div>
    </section>
  )
}

function Fact({ term, value, hint }: { term: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--textMuted)]">{term}</dt>
      <dd className="mt-0.5 text-sm text-[var(--text)]">{value}</dd>
      {hint && <dd className="text-xs text-[var(--textMuted)]">{hint}</dd>}
    </div>
  )
}

function RailFact({ label, sub, tone }: { label: string; sub?: string; tone?: 'good' | 'warn' }) {
  const color = tone === 'good' ? 'text-green-400' : tone === 'warn' ? 'text-[var(--danger)]' : 'text-[var(--text)]'
  return (
    <li className="flex items-start gap-2">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="2.5" aria-hidden="true" className="mt-0.5 flex-shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
      <span>
        <span className={`block font-medium ${color}`}>{label}</span>
        {sub && <span className="block text-xs text-[var(--textMuted)]">{sub}</span>}
      </span>
    </li>
  )
}
