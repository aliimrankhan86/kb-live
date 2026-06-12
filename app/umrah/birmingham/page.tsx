import { Metadata } from 'next'
import { CityCorridor } from '@/components/marketing/CityCorridor'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'

export const metadata: Metadata = {
  title: 'Umrah Packages from Birmingham 2026 – Compare & Book',
  description:
    'Browse and compare Umrah packages departing from Birmingham Airport (BHX). Verified UK operators, hotels near Haram, flights included. Request a quote now.',
  alternates: { canonical: '/umrah/birmingham' },
  openGraph: {
    title: 'Umrah Packages from Birmingham 2026 – Compare & Book | PilgrimCompare',
    description: 'Compare Umrah packages departing from Birmingham BHX with verified UK operators.',
    url: 'https://pilgrimcompare.co.uk/umrah/birmingham',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
}

const faqs = [
  {
    question: 'Does Birmingham Airport fly direct to Jeddah for Umrah?',
    answer:
      'Birmingham Airport (BHX) offers direct and one-stop flights to Jeddah (JED) and Madinah (MED), particularly during peak Umrah seasons. Some operators charter direct flights from Birmingham. Always confirm departure airport with your operator.',
  },
  {
    question: 'How much is an Umrah package from Birmingham?',
    answer:
      'Umrah packages from Birmingham Airport typically start from around £850 per person for budget options and can exceed £3,000 for premium 5-star packages close to the Grand Mosque. Prices vary by season, hotel grade, and inclusions.',
  },
  {
    question: 'Are there Umrah operators based in Birmingham?',
    answer:
      'Yes, Birmingham has a large Muslim community and several established Umrah operators. PilgrimCompare lists verified operators who accept bookings from Birmingham travellers, including those offering BHX departure options.',
  },
  {
    question: 'What is included in a typical Umrah package from Birmingham?',
    answer:
      'Most full Umrah packages from Birmingham include return flights, hotel accommodation in Makkah and Madinah, airport transfers, and Umrah visa processing. Some also include meals and a guided ziyarat (religious site visit). Check each package for exact inclusions.',
  },
]

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah/birmingham',
    name: 'Umrah Packages from Birmingham 2026 – Compare & Book | PilgrimCompare',
    description:
      'Compare Umrah packages departing from Birmingham Airport BHX with verified UK operators.',
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah', path: '/umrah' },
    { name: 'Umrah from Birmingham', path: '/umrah/birmingham' },
  ]),
  faqPageJsonLd(faqs),
])

export default async function BirminghamUmrahPage() {
  const departureCities = await Repository.getDistinctDepartureCities()
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
        intro="Find Umrah packages departing from Birmingham Airport (BHX). Compare verified UK operators side by side, filter by hotel rating and distance to Haram, and request a quote in minutes."
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
