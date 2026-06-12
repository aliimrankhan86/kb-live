import type { Metadata } from 'next'
import Link from 'next/link'
import { Hero } from '@/components/marketing/Hero'
import { JsonLdScript, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'

const STATIC_CORRIDOR_LINKS = [
  { label: 'Ramadan Umrah 2027', href: '/umrah/ramadan' },
  { label: 'Umrah cost guide', href: '/umrah/cost' },
  { label: 'Hajj packages 2027', href: '/hajj' },
]

export const metadata: Metadata = {
  title: 'PilgrimCompare - Compare Hajj & Umrah Packages from UK Operators',
  description:
    'Compare Hajj and Umrah packages from UK travel operators. Review prices, hotels near Haram, inclusions, ATOL/ABTA details, and operator profiles before requesting a quote.',
  keywords: ['Umrah packages UK', 'Hajj packages UK', 'compare Umrah packages', 'ATOL Umrah operators'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PilgrimCompare - Compare Hajj & Umrah Packages',
    description:
      'Search and compare pilgrimage packages with transparent prices, hotel details, inclusions, and UK operator trust signals.',
    url: 'https://pilgrimcompare.co.uk/',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PilgrimCompare - Compare Hajj & Umrah Packages',
    description:
      'Compare UK Hajj and Umrah packages by price, hotels, inclusions, and operator trust signals.',
  },
}

const homeJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/',
    name: 'PilgrimCompare — Compare Hajj and Umrah Packages from UK Operators',
    description:
      'Compare Hajj and Umrah packages from UK travel operators by price, hotel proximity, inclusions, and operator trust signals.',
  }),
  faqPageJsonLd([
    {
      question: 'What does PilgrimCompare compare?',
      answer:
        'PilgrimCompare compares Hajj and Umrah packages by price, departure route, hotel details, inclusions, nights split, and visible operator trust signals such as verification status, ATOL number, and ABTA details where provided.',
    },
    {
      question: 'Does PilgrimCompare take payment for packages?',
      answer:
        'No. PilgrimCompare is a comparison and enquiry service. You pay the operator directly. PilgrimCompare does not receive or hold your payment.',
    },
  ]),
])

export default async function Home() {
  const departureCities = await Repository.getDistinctDepartureCities()
  const cityLinks = departureCities.map((city) => ({
    label: `Umrah from ${city}`,
    href: `/umrah/${city.toLowerCase()}`,
  }))
  const corridorLinks = [...cityLinks, ...STATIC_CORRIDOR_LINKS]

  return (
    <>
      <JsonLdScript data={homeJsonLd} />
      <Hero />
      {/* Internal navigation — links homepage to corridor and guide pages for SEO and user discovery */}
      <section className="mx-auto max-w-4xl px-4 py-8 border-t border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--textMuted)] uppercase tracking-wide mb-4">
          Popular routes and guides
        </h2>
        <nav aria-label="Popular Umrah routes" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {corridorLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--yellow)]/40 hover:text-[var(--yellow)] transition-colors text-center"
            >
              {label}
            </Link>
          ))}
        </nav>
      </section>
    </>
  )
}
