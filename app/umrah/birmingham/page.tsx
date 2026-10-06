import type { Metadata } from 'next'
import { CityCorridor } from '@/components/marketing/CityCorridor'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'
import { corridorDescription, corridorFaqs, corridorIntro } from '@/lib/seo/corridor-faqs'

export async function generateMetadata(): Promise<Metadata> {
  const cities = await Repository.getDistinctDepartureCities().catch(() => [] as string[])
  const hasSupply = cities.includes('Birmingham')
  return {
    title: 'Umrah Packages from Birmingham: Compare Verified UK Operators | PilgrimCompare',
    description: corridorDescription('Birmingham'),
    alternates: { canonical: '/umrah/birmingham' },
    robots: hasSupply ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: 'Umrah Packages from Birmingham: Compare Verified UK Operators | PilgrimCompare',
      description: corridorDescription('Birmingham'),
      url: 'https://pilgrimcompare.co.uk/umrah/birmingham',
      siteName: 'PilgrimCompare',
      type: 'website',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Umrah Packages from Birmingham: Compare Verified UK Operators | PilgrimCompare',
      description: corridorDescription('Birmingham'),
    },
  }
}

const faqs = corridorFaqs('Birmingham')

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah/birmingham',
    name: 'Umrah Packages from Birmingham: Compare Verified UK Operators',
    description: corridorDescription('Birmingham'),
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah', path: '/umrah' },
    { name: 'Umrah from Birmingham', path: '/umrah/birmingham' },
  ]),
  faqPageJsonLd(faqs),
])

export default async function BirminghamUmrahPage() {
  // A DB blip must not take the page down; the honest 'no packages' notice shows instead.
  const departureCities = await Repository.getDistinctDepartureCities().catch(() => [] as string[])
  const hasPackages = departureCities.includes('Birmingham')

  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      {!hasPackages && (
        <p className="mx-auto mt-8 max-w-3xl px-4 rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] py-4 text-sm text-[var(--textMuted)]">
          No packages currently listed from Birmingham. New operators are being added.
        </p>
      )}
      <CityCorridor
        city="Birmingham"
        h1="Umrah Packages from Birmingham"
        intro={corridorIntro('Birmingham')}
        queryParams="?type=umrah&departureCity=Birmingham"
        faqs={faqs}
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Umrah', href: '/umrah' },
          { label: 'Birmingham' },
        ]}
      />
    </>
  )
}
