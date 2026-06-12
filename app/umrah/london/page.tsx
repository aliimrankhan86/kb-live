import type { Metadata } from 'next'
import { CityCorridor } from '@/components/marketing/CityCorridor'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'

export async function generateMetadata(): Promise<Metadata> {
  const cities = await Repository.getDistinctDepartureCities().catch(() => [] as string[])
  const hasSupply = cities.includes('London')
  return {
    title: 'Umrah Packages from London 2026 – Compare UK Operators | PilgrimCompare',
    description:
      'Browse and compare Umrah packages departing from London Heathrow and Gatwick. Verified UK operators, hotels near Haram, and ATOL details displayed.',
    alternates: { canonical: '/umrah/london' },
    robots: hasSupply ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: 'Umrah Packages from London 2026 | PilgrimCompare',
      description: 'Compare Umrah packages departing from London with verified UK operators.',
      url: 'https://pilgrimcompare.co.uk/umrah/london',
      siteName: 'PilgrimCompare',
      type: 'website',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Umrah Packages from London 2026 | PilgrimCompare',
      description: 'Compare Umrah packages departing from London with verified UK operators.',
    },
  }
}

const faqs = [
  {
    question: 'Which London airports offer direct flights to Jeddah for Umrah?',
    answer:
      'London Heathrow (LHR) and London Gatwick (LGW) offer the most frequent direct and connecting flights to Jeddah (JED) and Madinah (MED). London Stansted (STN) also has seasonal charter services from some operators.',
  },
  {
    question: 'How much does an Umrah package from London cost?',
    answer:
      'Umrah packages from London typically start from around £800 per person for budget packages and can reach £3,000 or more for premium 5-star hotel stays near the Haram. Price depends on departure date, hotel rating, and inclusions.',
  },
  {
    question: 'How do I compare Umrah packages from London on PilgrimCompare?',
    answer:
      'Use the search filters to set your departure city to London, select your travel dates and number of travellers, then compare up to 3 packages side by side. All operators are verified before listing.',
  },
  {
    question: 'Are London-based Umrah operators ATOL protected?',
    answer:
      'ATOL protection applies to package holidays that include flights. Many UK Umrah operators hold ATOL licences. Always check the operator\'s ATOL number before booking and confirm with the CAA register.',
  },
]

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah/london',
    name: 'Umrah Packages from London 2026 – Compare UK Operators | PilgrimCompare',
    description:
      'Compare Umrah packages departing from London Heathrow and Gatwick with verified UK operators.',
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah', path: '/umrah' },
    { name: 'Umrah from London', path: '/umrah/london' },
  ]),
  faqPageJsonLd(faqs),
])

export default async function LondonUmrahPage() {
  const departureCities = await Repository.getDistinctDepartureCities()
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
        intro="Find Umrah packages departing from London Heathrow, Gatwick, and Stansted. Compare verified UK operators side by side, filter by hotel rating and distance to Haram, and request a quote in minutes."
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
