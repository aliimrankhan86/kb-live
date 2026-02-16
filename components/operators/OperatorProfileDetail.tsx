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
  return (
    <section data-testid="operator-page" className="w-full max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-[var(--textMuted)]">Operator profile</p>
        <h1 data-testid="operator-name" className="mt-2 text-3xl font-semibold text-[var(--text)]">
          {operator.companyName}
        </h1>
        <p data-testid="operator-status" className="mt-2 text-sm text-[var(--textMuted)]">
          Status: {formatStatus(operator.verificationStatus)}
        </p>
      </header>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold text-[var(--text)]">About the operator</h2>
        <p className="mt-3 text-sm text-[var(--textMuted)]">
          {operator.companyName} arranges pilgrimage packages tailored to your schedule and budget. Contact
          them to confirm availability, inclusions, and final pricing.
        </p>
      </section>

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
                    scroll={false}
                    data-testid={`operator-package-link-${pkg.slug}`}
                    className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    {pkg.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-[var(--textMuted)]">
                  {pkg.totalNights} nights · {pkg.nightsMakkah} Makkah · {pkg.nightsMadinah} Madinah
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
