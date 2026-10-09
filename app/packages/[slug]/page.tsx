import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PackageDetail } from '@/components/packages/PackageDetail'
import { DepartedNotice } from '@/components/packages/DepartedNotice'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Repository } from '@/lib/api/repository'
import { isRfqQuoteEnabled } from '@/lib/config'
import { hasDeparted } from '@/lib/listing'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, packageJsonLd, touristTripJsonLd } from '@/lib/seo/json-ld'
import type { Package, OperatorProfile } from '@/lib/types'
import { PackageUnavailable } from './not-found'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const { slug } = await params
    const pkg = await Repository.getPublicPackageBySlug(slug)
    if (pkg && hasDeparted(pkg)) {
      return { title: 'This departure has passed', robots: { index: false, follow: true } }
    }
    if (pkg && pkg.status === 'published') {
      const operator = await Repository.getOperatorById(pkg.operatorId)
      const operatorName = operator?.companyName ?? 'PilgrimCompare operator'
      const packageType = pkg.pilgrimageType === 'hajj' ? 'Hajj' : 'Umrah'
      const price = `£${pkg.pricePerPerson.toLocaleString('en-GB')}`
      const hotelStars = Math.max(pkg.hotelMakkahStars ?? 0, pkg.hotelMadinahStars ?? 0)

      const ogDescription = `${packageType} package by ${operatorName}. ${pkg.totalNights} nights, ${price} per person. Compare inclusions and send an enquiry.`
      return {
        title: `${pkg.title} by ${operatorName}`,
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
    robots: { index: false, follow: false },
  }
}

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
    pkg = await Repository.getPublicPackageBySlug(slug)
    if (pkg) {
      operator = await Repository.getOperatorById(pkg.operatorId)
    }
  } catch (err) {
    // Internal error detail stays in the server log, never on the page.
    console.error(err)
    error = 'Unable to load this package right now.'
  }

  if (error) {
    // A load failure stays a rendered message, never indexable even when
    // generateMetadata loaded the package: React hoists this tag into <head>.
    return (
      <>
        <meta name="robots" content="noindex, nofollow" />
        <PackageUnavailable message={error} />
      </>
    )
  }

  // Past departures keep their URL but show a notice, never the enquiry form.
  if (pkg && hasDeparted(pkg)) {
    return <div className="min-h-screen bg-[var(--background)]"><DepartedNotice pkg={pkg} /></div>
  }

  // Real HTTP 404 (not-found.tsx), never a soft 404 with a 200.
  if (!pkg || pkg.status !== 'published') notFound()

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
    { label: 'Packages', href: '/packages' },
    { label: pkg.title },
  ];
  // Standards §13: seller/provider is always the operator, never PilgrimCompare.
  // Without a known operator the Product/Trip nodes are simply not emitted.
  const packageDetailJsonLd = graphJsonLd([
    ...(operator ? [packageJsonLd(pkg, operator.companyName), touristTripJsonLd(pkg, operator.companyName)] : []),
    breadcrumbJsonLd(breadcrumbItems.map((item) => ({ name: item.label, path: item.href }))),
    faqPageJsonLd([
      {
        question: 'Is this package price final?',
        answer:
          'The package price is shown for comparison. Final availability, itinerary, inclusions, and payment terms are confirmed by the travel operator.',
      },
      {
        question: 'Who provides this pilgrimage package?',
        answer: `${operator?.companyName ?? 'The listed operator'} provides this package. PilgrimCompare helps travellers compare details and send an enquiry to the operator.`,
      },
    ]),
  ]);

  return (
    <>
      <div className="min-h-screen bg-[var(--background)]" data-plain-background>
        <JsonLdScript data={packageDetailJsonLd} />
        <div className="w-full max-w-5xl mx-auto px-4 pt-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <PackageDetail pkg={pkg} operator={operator} rfqEnabled={isRfqQuoteEnabled()} />
      </div>
    </>
  )
}
