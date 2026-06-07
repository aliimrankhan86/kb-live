import Link from 'next/link'
import type { OperatorProfile, Package } from '@/lib/types'

interface OperatorProfileDetailProps {
  operator: OperatorProfile
  packages: Package[]
}

const formatStatus = (status: OperatorProfile['verificationStatus']) => {
  switch (status) {
    case 'verified':
      return 'Verified'
    case 'rejected':
      return 'Not verified'
    default:
      return 'Pending verification'
  }
}

export function OperatorProfileDetail({ operator, packages }: OperatorProfileDetailProps) {
  const hasContact = operator.websiteUrl || operator.contactPhone

  return (
    <section data-testid="operator-page" className="w-full max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-[var(--textMuted)]">Operator profile</p>
        <h1 data-testid="operator-name" className="mt-2 text-3xl font-semibold text-[var(--text)]">
          {operator.companyName}
          {operator.tradingName && operator.tradingName !== operator.companyName && (
            <span className="ml-2 text-lg font-normal text-[var(--textMuted)]">({operator.tradingName})</span>
          )}
        </h1>
        <p data-testid="operator-status" className="mt-2 text-sm text-[var(--textMuted)]">
          Status: {formatStatus(operator.verificationStatus)}
          {operator.yearsInBusiness != null && (
            <span className="ml-3 text-[var(--textMuted)]">· {operator.yearsInBusiness} years in business</span>
          )}
        </p>

        {/* ATOL/ABTA Protection Badges */}
        <div className="mt-3 flex flex-wrap gap-2" data-testid="operator-protection-badges">
          {operator.atolNumber && (
            <div className="inline-flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm">
              <span aria-hidden="true" className="text-green-400 font-bold">✓</span>
              <span className="text-green-300">ATOL {operator.atolNumber}</span>
            </div>
          )}
          {operator.abtaMemberNumber && (
            <div className="inline-flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm">
              <span aria-hidden="true" className="text-green-400 font-bold">✓</span>
              <span className="text-green-300">ABTA {operator.abtaMemberNumber}</span>
            </div>
          )}
          {!operator.atolNumber && !operator.abtaMemberNumber && (
            <div
              className="inline-flex items-center gap-2 rounded-md border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-1.5 text-sm"
              role="alert"
            >
              <span aria-hidden="true" className="text-[var(--danger)] font-bold">⚠</span>
              <span className="text-[var(--danger)]">
                No ATOL/ABTA protection listed — verify directly before booking
              </span>
            </div>
          )}
        </div>
      </header>

      {/* About + quick-stats grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* About */}
        <div className="md:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--text)]">About the operator</h2>
          <p className="mt-3 text-sm text-[var(--textMuted)]">
            {operator.companyName} arranges pilgrimage packages tailored to your schedule and budget.
            Contact them to confirm availability, inclusions, and final pricing.
          </p>

          {/* Departure airports */}
          {operator.departureAirports && operator.departureAirports.length > 0 && (
            <div className="mt-4" data-testid="operator-departure-airports">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--textMuted)] mb-1.5">
                Departure airports
              </p>
              <div className="flex flex-wrap gap-1.5">
                {operator.departureAirports.map((code) => (
                  <span
                    key={code}
                    className="rounded border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-xs font-mono text-[var(--text)]"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Serving regions */}
          {operator.servingRegions && operator.servingRegions.length > 0 && (
            <div className="mt-4" data-testid="operator-serving-regions">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--textMuted)] mb-1.5">
                Serving
              </p>
              <p className="text-sm text-[var(--text)]">{operator.servingRegions.join(', ')}</p>
            </div>
          )}
        </div>

        {/* Contact sidebar */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5" data-testid="operator-contact">
          <h2 className="text-lg font-semibold text-[var(--text)]">Contact</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li>
              <span className="block text-xs uppercase tracking-wide text-[var(--textMuted)]">Email</span>
              <a
                href={`mailto:${operator.contactEmail}`}
                className="mt-0.5 text-[var(--yellow)] hover:underline break-all"
                data-testid="operator-contact-email"
              >
                {operator.contactEmail}
              </a>
            </li>
            {operator.contactPhone && (
              <li>
                <span className="block text-xs uppercase tracking-wide text-[var(--textMuted)]">Phone</span>
                <a
                  href={`tel:${operator.contactPhone}`}
                  className="mt-0.5 text-[var(--text)] hover:underline"
                  data-testid="operator-contact-phone"
                >
                  {operator.contactPhone}
                </a>
              </li>
            )}
            {operator.websiteUrl && (
              <li>
                <span className="block text-xs uppercase tracking-wide text-[var(--textMuted)]">Website</span>
                <a
                  href={operator.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 text-[var(--yellow)] hover:underline break-all"
                  data-testid="operator-website"
                >
                  {operator.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              </li>
            )}
            {operator.officeAddress && (
              <li>
                <span className="block text-xs uppercase tracking-wide text-[var(--textMuted)]">Address</span>
                <address className="mt-0.5 not-italic text-[var(--textMuted)]" data-testid="operator-address">
                  {operator.officeAddress.line1}
                  {operator.officeAddress.line2 && <>, {operator.officeAddress.line2}</>}<br />
                  {operator.officeAddress.city}, {operator.officeAddress.postcode}
                </address>
              </li>
            )}
            {!hasContact && (
              <li className="text-[var(--textMuted)] text-xs italic">
                No additional contact details provided.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Packages */}
      <section data-testid="operator-packages" className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--text)]">Published packages</h2>

        {packages.length === 0 ? (
          <div
            role="alert"
            data-testid="operator-empty"
            className="mt-4 rounded border border-dashed border-[var(--border)] px-4 py-6 text-center"
          >
            <p className="text-sm text-[var(--textMuted)]">
              This operator has no published packages yet.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {packages.map((pkg) => (
              <li
                key={pkg.id}
                data-testid={`operator-package-card-${pkg.id}`}
                className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5"
              >
                <p className="text-xs uppercase tracking-wide text-[var(--textMuted)]">
                  {pkg.pilgrimageType} · {pkg.seasonLabel ?? 'Flexible'}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--text)]">
                  <Link
                    href={`/packages/${pkg.slug}`}
                    data-testid={`operator-package-link-${pkg.slug}`}
                    className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    {pkg.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-[var(--textMuted)]">
                  {pkg.totalNights} nights · {pkg.nightsMakkah} Makkah · {pkg.nightsMadinah} Madinah
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--yellow)]">
                  {pkg.priceType === 'from' ? 'From ' : ''}£{pkg.pricePerPerson.toLocaleString()} per person
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
