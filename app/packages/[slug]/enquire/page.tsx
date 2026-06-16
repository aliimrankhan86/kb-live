import type { Metadata } from 'next'
import { EnquiryForm, type EnquirySummary } from '@/components/enquiry/EnquiryForm'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Repository } from '@/lib/api/repository'
import type { OperatorProfile, Package } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Enquire | PilgrimCompare',
  description: 'Send a short enquiry to the operator about this package.',
  robots: { index: false, follow: false },
}

const NOT_PROVIDED = 'Not provided'

const renderNotice = (message: string) => (
  <section className="w-full max-w-2xl mx-auto px-4 py-16">
    <div role="alert" data-testid="enquiry-package-not-found" className="rounded border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-5 py-4">
      <h1 className="text-2xl font-semibold text-[var(--text)]">Package not available</h1>
      <p className="mt-2 text-sm text-[var(--color-error)]">{message}</p>
    </div>
  </section>
)

/** Build the read-only summary from package data. Honest: missing → "Not provided". */
function buildSummary(pkg: Package, operator: OperatorProfile | undefined): EnquirySummary {
  const tripType = pkg.pilgrimageType === 'hajj' ? 'Hajj' : 'Umrah'
  const price = `${pkg.priceType === 'from' ? 'From ' : ''}£${pkg.pricePerPerson.toLocaleString('en-GB')} per person`
  const stars = [
    pkg.hotelMakkahStars ? `${pkg.hotelMakkahStars}★ Makkah` : null,
    pkg.hotelMadinahStars ? `${pkg.hotelMadinahStars}★ Madinah` : null,
  ].filter(Boolean)

  return {
    packageId: pkg.id,
    packageTitle: pkg.title,
    operatorName: operator?.tradingName ?? operator?.companyName ?? 'the travel operator',
    tripType,
    departureAirport: pkg.departureAirport || NOT_PROVIDED,
    duration: `${pkg.totalNights} nights (${pkg.nightsMakkah} Makkah · ${pkg.nightsMadinah} Madinah)`,
    hotels: stars.length > 0 ? stars.join(' · ') : NOT_PROVIDED,
    price,
  }
}

export default async function EnquirePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let pkg: Package | undefined
  let operator: OperatorProfile | undefined
  try {
    pkg = await Repository.getPackageBySlug(slug)
    if (pkg) operator = await Repository.getOperatorById(pkg.operatorId)
  } catch {
    return <main className="min-h-screen bg-[var(--background)]">{renderNotice('We could not load this package right now. Please try again.')}</main>
  }

  if (!pkg || pkg.status !== 'published') {
    return <main className="min-h-screen bg-[var(--background)]">{renderNotice('This package is no longer available.')}</main>
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Packages', href: '/search/packages' },
    { label: pkg.title, href: `/packages/${pkg.slug}` },
    { label: 'Enquire' },
  ]

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="w-full max-w-2xl mx-auto px-4 pt-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <EnquiryForm summary={buildSummary(pkg, operator)} packageSlug={pkg.slug} />
    </main>
  )
}
