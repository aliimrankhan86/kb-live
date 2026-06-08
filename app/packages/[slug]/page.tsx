import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { PackageDetail } from '@/components/packages/PackageDetail'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Repository } from '@/lib/api/repository'
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
      const operatorName = operator?.companyName ?? 'KaabaTrip operator'
      const packageType = pkg.pilgrimageType === 'hajj' ? 'Hajj' : 'Umrah'
      const price = `£${pkg.pricePerPerson.toLocaleString('en-GB')}`
      const hotelStars = Math.max(pkg.hotelMakkahStars ?? 0, pkg.hotelMadinahStars ?? 0)

      return {
        title: `${pkg.title} - ${packageType} Package`,
        description: `${pkg.title} by ${operatorName}. ${pkg.totalNights} nights, ${hotelStars || 'listed'} star hotels, ${price} per person. Compare inclusions and request a quote.`,
        alternates: {
          canonical: `/packages/${pkg.slug}`,
        },
        openGraph: pkg.images?.[0]
          ? {
              title: `${pkg.title} | KaabaTrip`,
              description: `${packageType} package from ${operatorName} with ${pkg.totalNights} nights and transparent package details.`,
              url: `https://kaabatrip.com/packages/${pkg.slug}`,
              siteName: 'KaabaTrip',
              type: 'website',
              locale: 'en_GB',
              images: [{ url: pkg.images[0], width: 1200, height: 630, alt: pkg.title }],
            }
          : {
              title: `${pkg.title} | KaabaTrip`,
              description: `${packageType} package from ${operatorName} with ${pkg.totalNights} nights and transparent package details.`,
              url: `https://kaabatrip.com/packages/${pkg.slug}`,
              siteName: 'KaabaTrip',
              type: 'website',
              locale: 'en_GB',
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
    packageJsonLd(pkg, operator?.companyName ?? 'KaabaTrip'),
    touristTripJsonLd(pkg, operator?.companyName ?? 'KaabaTrip'),
    breadcrumbJsonLd(breadcrumbItems.map((item) => ({ name: item.label, path: item.href }))),
    faqPageJsonLd([
      {
        question: 'Is this package price final?',
        answer:
          'The package price is shown for comparison. Final availability, itinerary, inclusions, and payment terms are confirmed by the travel operator.',
      },
      {
        question: 'Who provides this pilgrimage package?',
        answer: `${operator?.companyName ?? 'The listed operator'} provides this package. KaabaTrip helps travellers compare details and request a quote.`,
      },
    ]),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)]">
        <JsonLdScript data={packageDetailJsonLd} />
        <div className="w-full max-w-5xl mx-auto px-4 pt-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <PackageDetail pkg={pkg} operator={operator} />
      </main>
    </>
  )
}
