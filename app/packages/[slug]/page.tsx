import type { Metadata } from 'next'
import { PackageDetail } from '@/components/packages/PackageDetail'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Repository } from '@/lib/api/repository'
import { isRfqQuoteEnabled } from '@/lib/config'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, packageJsonLd, touristTripJsonLd } from '@/lib/seo/json-ld'
import type { Package, OperatorProfile } from '@/lib/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const { slug } = await params
    const pkg = await Repository.getPackageBySlug(slug)
    if (pkg && pkg.status === 'published') {
      const operator = await Repository.getOperatorById(pkg.operatorId)
      const operatorName = operator?.companyName ?? 'PilgrimCompare operator'
      const packageType = pkg.pilgrimageType === 'hajj' ? 'Hajj' : 'Umrah'
      const price = `£${pkg.pricePerPerson.toLocaleString('en-GB')}`
      const hotelStars = Math.max(pkg.hotelMakkahStars ?? 0, pkg.hotelMadinahStars ?? 0)

      const ogDescription = `${packageType} package by ${operatorName}. ${pkg.totalNights} nights, ${price} per person. Compare inclusions and send an enquiry.`
      return {
        title: `${pkg.title} by ${operatorName} | Compare on PilgrimCompare`,
        description: `${pkg.title} by ${operatorName}. ${pkg.totalNights} nights, ${hotelStars ? `${hotelStars}-star hotels,` : ''} ${price} per person. Compare inclusions and send an enquiry.`,
        alternates: {
          canonical: `/packages/${pkg.slug}`,
        },
        openGraph: {
          title: `${pkg.title} by ${operatorName} | PilgrimCompare`,
          description: ogDescription,
          url: `https://pilgrimcompare.co.uk/packages/${pkg.slug}`,
          siteName: 'PilgrimCompare',
          type: 'website',
          locale: 'en_GB',
          ...(pkg.images?.[0]
            ? { images: [{ url: pkg.images[0], width: 1200, height: 630, alt: pkg.title }] }
            : {}),
        },
        twitter: {
          card: 'summary_large_image',
          title: `${pkg.title} by ${operatorName} | PilgrimCompare`,
          description: ogDescription,
          ...(pkg.images?.[0] ? { images: [pkg.images[0]] } : {}),
        },
      }
    }
  } catch {
    // fall through to generic metadata
  }

  return {
    title: 'Package not found',
    description: 'Package details are unavailable.',
  }
}

const renderNotFound = (message: string) => (
  <section className="w-full max-w-3xl mx-auto px-4 py-16">
    <div role="alert" data-testid="package-not-found" className="rounded border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-5 py-4">
      <h1 className="text-2xl font-semibold text-[var(--text)]">Package not found</h1>
      <p className="mt-2 text-sm text-[var(--color-error)]">{message}</p>
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
  let operator: OperatorProfile | undefined

  try {
    pkg = await Repository.getPackageBySlug(slug)
    if (pkg) {
      operator = await Repository.getOperatorById(pkg.operatorId)
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load this package right now.'
  }

  if (error) {
    return (
      <>
        <main className="min-h-screen bg-[var(--background)]">{renderNotFound(error)}</main>
      </>
    )
  }

  if (!pkg || pkg.status !== 'published') {
    return (
      <>
        <main className="min-h-screen bg-[var(--background)]">
          {renderNotFound('This package is no longer available.')}
        </main>
      </>
    )
  }

  try {
    await Repository.trackEvent(pkg.operatorId, 'package_view', pkg.id, undefined, {
      slug: pkg.slug,
      type: pkg.pilgrimageType,
    })
  } catch {
    // Analytics must not block package rendering.
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Packages', href: '/search/packages' },
    { label: pkg.title },
  ];
  const packageDetailJsonLd = graphJsonLd([
    packageJsonLd(pkg, operator?.companyName ?? 'PilgrimCompare'),
    touristTripJsonLd(pkg, operator?.companyName ?? 'PilgrimCompare'),
    breadcrumbJsonLd(breadcrumbItems.map((item) => ({ name: item.label, path: item.href }))),
    faqPageJsonLd([
      {
        question: 'Is this package price final?',
        answer:
          'The package price is shown for comparison. Final availability, itinerary, inclusions, and payment terms are confirmed by the travel operator.',
      },
      {
        question: 'Who provides this pilgrimage package?',
        answer: `${operator?.companyName ?? 'The listed operator'} provides this package. PilgrimCompare helps travellers compare details and request a quote.`,
      },
    ]),
  ]);

  return (
    <>
      <main className="min-h-screen bg-[var(--background)]">
        <JsonLdScript data={packageDetailJsonLd} />
        <div className="w-full max-w-5xl mx-auto px-4 pt-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <PackageDetail pkg={pkg} operator={operator} rfqEnabled={isRfqQuoteEnabled()} />
      </main>
    </>
  )
}
