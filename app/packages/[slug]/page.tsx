import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { PackageDetail } from '@/components/packages/PackageDetail'
import { Repository } from '@/lib/api/repository'
import type { Package } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Package details',
  description: 'Review package details, inclusions, and pricing.',
}

const renderNotFound = (message: string) => (
  <section className="w-full max-w-3xl mx-auto px-4 py-16">
    <div role="alert" data-testid="package-not-found" className="rounded border border-red-500/30 bg-red-500/10 px-5 py-4">
      <h1 className="text-2xl font-semibold text-[var(--text)]">Package not found</h1>
      <p className="mt-2 text-sm text-red-100">{message}</p>
    </div>
  </section>
)

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let pkg: Package | undefined
  let error: string | undefined

  try {
    pkg = Repository.getPackageBySlug(slug)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load this package right now.'
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[var(--background)]">{renderNotFound(error)}</main>
      </>
    )
  }

  if (!pkg || pkg.status !== 'published') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[var(--background)]">
          {renderNotFound('This package is no longer available.')}
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)]">
        <PackageDetail pkg={pkg} />
      </main>
    </>
  )
}
