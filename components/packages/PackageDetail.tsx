import Link from 'next/link'
import type { Package } from '@/lib/types'

interface PackageDetailProps {
  pkg: Package
}

const formatPrice = (pkg: Package) => {
  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: pkg.currency,
    maximumFractionDigits: 0,
  }).format(pkg.pricePerPerson)

  return pkg.priceType === 'from' ? `From ${amount}` : amount
}

const formatDateWindow = (pkg: Package) => {
  if (!pkg.dateWindow) return 'Flexible'
  return `${pkg.dateWindow.start} to ${pkg.dateWindow.end}`
}

const renderBoolean = (value: boolean) => (value ? 'Included' : 'Not included')

export function PackageDetail({ pkg }: PackageDetailProps) {
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
            {formatPrice(pkg)}
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
        <button
          type="button"
          data-testid="package-cta-request-quote"
          className="rounded bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        >
          Request quote
        </button>
      </div>
    </section>
  )
}
