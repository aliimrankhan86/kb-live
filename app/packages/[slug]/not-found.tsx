import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Package not found',
  robots: { index: false, follow: false },
}

export function PackageUnavailable({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <section className="w-full max-w-3xl mx-auto px-4 py-16">
        <div role="alert" data-testid="package-not-found" className="rounded border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-5 py-4">
          <h1 className="text-2xl font-semibold text-[var(--text)]">Package not found</h1>
          <p className="mt-2 text-sm text-[var(--color-error)]">{message}</p>
        </div>
      </section>
    </div>
  )
}

// Rendered with HTTP 404 when page.tsx calls notFound(): an unknown slug, or a
// package that is not published and has not departed.
export default function PackageNotFound() {
  return <PackageUnavailable message="This package is no longer available." />
}
