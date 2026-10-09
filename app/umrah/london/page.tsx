import type { Metadata } from 'next'
import { CityCorridor } from '@/components/marketing/CityCorridor'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'
import { corridorDescription, corridorFaqs, corridorIntro } from '@/lib/seo/corridor-faqs'

export async function generateMetadata(): Promise<Metadata> {
  const cities = await Repository.getDistinctDepartureCities().catch(() => [] as string[])
  const hasSupply = cities.includes('London')
  return {
    title: 'Umrah Packages from London: Compare Verified UK Operators',
    description: corridorDescription('London'),
    alternates: { canonical: '/umrah/london' },
    robots: hasSupply ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: 'Umrah Packages from London: Compare Verified UK Operators | PilgrimCompare',
      description: corridorDescription('London'),
      url: 'https://pilgrimcompare.co.uk/umrah/london',
      siteName: 'PilgrimCompare',
      type: 'website',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Umrah Packages from London: Compare Verified UK Operators | PilgrimCompare',
      description: corridorDescription('London'),
    },
  }
}

const faqs = corridorFaqs('London')

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah/london',
    name: 'Umrah Packages from London: Compare Verified UK Operators',
    description: corridorDescription('London'),
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah', path: '/umrah' },
    { name: 'Umrah from London', path: '/umrah/london' },
  ]),
  faqPageJsonLd(faqs),
])

export default async function LondonUmrahPage() {
  // A DB blip must not take the page down; the honest 'no packages' notice shows instead.
  const departureCities = await Repository.getDistinctDepartureCities().catch(() => [] as string[])
  const hasPackages = departureCities.includes('London')

  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      {!hasPackages && (
        <p className="mx-auto mt-8 max-w-3xl px-4 rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] py-4 text-sm text-[var(--textMuted)]">
          No packages currently listed from London. New operators are being added.
        </p>
      )}
      <CityCorridor
        city="London"
        h1="Umrah Packages from London"
        intro={corridorIntro('London')}
        queryParams="?type=umrah&departureCity=London"
        faqs={faqs}
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Umrah', href: '/umrah' },
          { label: 'London' },
        ]}
      />
    </>
  )
}
