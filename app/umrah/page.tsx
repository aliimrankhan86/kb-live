import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { UmrahSearchForm } from '@/components/umrah/UmrahSearchForm'
import Link from 'next/link'
import { breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'

export const metadata: Metadata = {
  title: 'Umrah Packages 2026 from the UK - Compare Operators',
  description:
    'Compare Umrah packages from UK travel operators by budget, hotel rating, distance to Haram, traveller count, and included services before requesting a quote.',
  keywords: ['Umrah packages 2026', 'Umrah packages from UK', 'compare Umrah packages', 'Ramadan Umrah packages'],
  alternates: {
    canonical: '/umrah',
  },
  openGraph: {
    title: 'Umrah Packages 2026 from the UK | KaabaTrip',
    description:
      'Find Umrah packages by travel dates, budget, hotel rating, and operator trust signals.',
    url: 'https://kaabatrip.com/umrah',
    siteName: 'KaabaTrip',
    type: 'website',
    locale: 'en_GB',
  },
}

const umrahFaqs = [
  {
    question: 'How do I compare Umrah packages on KaabaTrip?',
    answer:
      'Choose your dates, travellers, hotel preference, and budget. KaabaTrip then shows matching packages so you can compare price, Makkah and Madinah hotels, inclusions, nights, and operator trust signals side by side.',
  },
  {
    question: 'What should UK travellers check before booking an Umrah package?',
    answer:
      'Check the operator profile, ATOL and ABTA details where listed, hotel names and distance to Haram, flight route, inclusions, cancellation policy, and final availability with the travel operator.',
  },
  {
    question: 'Are prices on KaabaTrip final booking prices?',
    answer:
      'Prices are indicative package prices shown for comparison. Final availability, itinerary, inclusions, and payment terms are confirmed by the travel operator.',
  },
  {
    question: 'How much does an Umrah package from the UK cost?',
    answer:
      'Umrah packages from the UK start from around £800 per person for budget off-peak departures. Mid-range 4-star packages typically cost £1,200–£2,500. Premium 5-star packages near the Grand Mosque in Makkah range from £2,500 to over £5,000. Ramadan and school holiday departures are 20–40% higher. See our Umrah cost guide for a full breakdown.',
  },
]

const umrahJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah',
    name: 'Umrah Packages 2026 from the UK',
    description:
      'Compare UK Umrah packages by travel dates, budget, hotel rating, distance to Haram, and operator trust signals.',
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah Packages', path: '/umrah' },
  ]),
  faqPageJsonLd(umrahFaqs),
])

export default function UmrahPage() {
  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(umrahJsonLd) }}
      />
      <main className="min-h-screen px-4 py-10">
        <UmrahSearchForm />
        <section
          className="mx-auto mt-8 w-full max-w-3xl rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5"
          aria-labelledby="umrah-seo-faq"
        >
          <h2 id="umrah-seo-faq" className="text-lg font-semibold text-[var(--text)]">
            Comparing Umrah packages from the UK
          </h2>
          <div className="mt-4 grid gap-4 text-sm text-[var(--textMuted)] sm:grid-cols-2">
            {umrahFaqs.map((item) => (
              <article key={item.question}>
                <h3 className="font-semibold text-[var(--text)]">{item.question}</h3>
                <p className="mt-2">{item.answer}</p>
              </article>
            ))}
          </div>
          {/* Internal links — cost guide and city corridors */}
          <nav aria-label="Related guides" className="mt-6 pt-5 border-t border-[var(--border)] flex flex-wrap gap-2">
            <Link href="/umrah/cost" className="rounded-lg border border-[var(--yellow)]/30 bg-[var(--yellow)]/5 px-3 py-1.5 text-xs font-medium text-[var(--yellow)] hover:bg-[var(--yellow)]/10 transition-colors">
              Umrah cost guide →
            </Link>
            {[
              { label: 'From London', href: '/umrah/london' },
              { label: 'From Birmingham', href: '/umrah/birmingham' },
              { label: 'From Manchester', href: '/umrah/manchester' },
              { label: 'Ramadan Umrah 2027', href: '/umrah/ramadan' },
            ].map(({ label, href }) => (
              <Link key={href} href={href} className="rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-3 py-1.5 text-xs font-medium text-[var(--textMuted)] hover:text-[var(--text)] hover:border-[var(--yellow)]/40 transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </section>
      </main>
    </>
  )
}
