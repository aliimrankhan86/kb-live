import type { Metadata } from 'next'
import { CityCorridor } from '@/components/marketing/CityCorridor'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'
import { corridorDescription, corridorFaqs, corridorIntro } from '@/lib/seo/corridor-faqs'

export async function generateMetadata(): Promise<Metadata> {
  const cities = await Repository.getDistinctDepartureCities().catch(() => [] as string[])
  const hasSupply = cities.includes('Manchester')
  return {
    title: 'Umrah Packages from Manchester: Compare Verified UK Operators | PilgrimCompare',
    description: corridorDescription('Manchester'),
    alternates: { canonical: '/umrah/manchester' },
    robots: hasSupply ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: 'Umrah Packages from Manchester: Compare Verified UK Operators | PilgrimCompare',
      description: corridorDescription('Manchester'),
      url: 'https://pilgrimcompare.co.uk/umrah/manchester',
      siteName: 'PilgrimCompare',
      type: 'website',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Umrah Packages from Manchester: Compare Verified UK Operators | PilgrimCompare',
      description: corridorDescription('Manchester'),
    },
  }
}

const faqs = corridorFaqs('Manchester')

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah/manchester',
    name: 'Umrah Packages from Manchester: Compare Verified UK Operators',
    description: corridorDescription('Manchester'),
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah', path: '/umrah' },
    { name: 'Umrah from Manchester', path: '/umrah/manchester' },
  ]),
  faqPageJsonLd(faqs),
])

export default async function ManchesterUmrahPage() {
  // A DB blip must not take the page down; the honest 'no packages' notice shows instead.
  const departureCities = await Repository.getDistinctDepartureCities().catch(() => [] as string[])
  const hasPackages = departureCities.includes('Manchester')

  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      {!hasPackages && (
        <p className="mx-auto mt-8 max-w-3xl px-4 rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] py-4 text-sm text-[var(--textMuted)]">
          No packages currently listed from Manchester. New operators are being added.
        </p>
      )}
      <CityCorridor
        city="Manchester"
        h1="Umrah Packages from Manchester"
        intro={corridorIntro('Manchester')}
        queryParams="?type=umrah&departureCity=Manchester"
        faqs={faqs}
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Umrah', href: '/umrah' },
          { label: 'Manchester' },
        ]}
      />
    </>
  )
}
