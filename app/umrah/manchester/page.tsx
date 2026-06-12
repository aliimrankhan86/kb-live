import { Metadata } from 'next'
import { CityCorridor } from '@/components/marketing/CityCorridor'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'

export const metadata: Metadata = {
  title: 'Umrah Packages from Manchester 2026 – Compare & Book',
  description:
    'Browse and compare Umrah packages departing from Manchester Airport (MAN). Verified UK operators, hotels near Haram, flights included. Request a quote now.',
  alternates: { canonical: '/umrah/manchester' },
  openGraph: {
    title: 'Umrah Packages from Manchester 2026 – Compare & Book | PilgrimCompare',
    description: 'Compare Umrah packages departing from Manchester MAN with verified UK operators.',
    url: 'https://pilgrimcompare.co.uk/umrah/manchester',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
}

const faqs = [
  {
    question: 'Does Manchester Airport fly to Jeddah for Umrah?',
    answer:
      'Yes, Manchester Airport (MAN) has regular direct and connecting flights to Jeddah (JED) and Madinah (MED). It is one of the busiest UK departure points for Umrah travellers, particularly from the North of England.',
  },
  {
    question: 'How much does an Umrah package from Manchester cost?',
    answer:
      'Umrah packages from Manchester typically start from around £850 per person for budget departures. Premium 5-star packages with hotels adjacent to the Grand Mosque can exceed £3,500. Ramadan and peak season departures are usually priced higher.',
  },
  {
    question: 'Are there Umrah operators covering the North of England?',
    answer:
      'Yes, many UK Umrah operators offer packages departing from Manchester Airport, serving travellers across the North of England, including Manchester, Leeds, Sheffield, and Bradford. PilgrimCompare lists verified operators with MAN departure options.',
  },
  {
    question: 'What should I check before booking an Umrah package from Manchester?',
    answer:
      'Check: (1) ATOL or ABTA number of the operator; (2) hotel distance to the Grand Mosque in Makkah; (3) whether flights depart from MAN or require a transfer; (4) what is included — visa, transfers, meals; (5) cancellation and refund policy.',
  },
]

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah/manchester',
    name: 'Umrah Packages from Manchester 2026 – Compare & Book | PilgrimCompare',
    description:
      'Compare Umrah packages departing from Manchester Airport MAN with verified UK operators.',
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah', path: '/umrah' },
    { name: 'Umrah from Manchester', path: '/umrah/manchester' },
  ]),
  faqPageJsonLd(faqs),
])

export default async function ManchesterUmrahPage() {
  const departureCities = await Repository.getDistinctDepartureCities()
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
        intro="Find Umrah packages departing from Manchester Airport (MAN). Compare verified UK operators side by side, filter by hotel rating and distance to Haram, and request a quote in minutes."
        queryParams="?type=umrah&departureCity=Manchester"
        faqs={faqs}
      />
    </>
  )
}
