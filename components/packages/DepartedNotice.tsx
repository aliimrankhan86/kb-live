import Link from 'next/link'
import type { Package } from '@/lib/types'
import { formatDate } from '@/lib/packages/display'

/** Shown in place of the package and its enquiry form once the departure has passed. */
export function DepartedNotice({ pkg }: { pkg: Pick<Package, 'title' | 'dateWindow'> }) {
  const start = pkg.dateWindow?.start
  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-16">
      <div role="status" data-testid="package-departed" className="rounded border border-[var(--borderSubtle)] bg-[var(--panel)] px-5 py-4">
        <h1 className="text-2xl font-semibold text-[var(--text)]">This departure has passed</h1>
        <p className="mt-2 text-sm text-[var(--textMuted)]">
          {pkg.title}{start ? ` departed on ${formatDate(start)}` : ''}. You can no longer send an enquiry for it.
        </p>
        <Link
          href="/packages"
          data-testid="package-departed-back"
          className="mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--primary)] underline underline-offset-4"
        >
          Browse current packages
        </Link>
      </div>
    </section>
  )
}
