import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'

export const metadata: Metadata = {
  title: 'Ramadan Umrah Packages 2027 from the UK',
  description:
    'Compare Ramadan Umrah packages from verified UK operators for 2027. Perform Umrah during the holiest month with ATOL-protected operators — hotels near the Grand Mosque, flights, and visa included.',
  alternates: { canonical: '/umrah/ramadan' },
  openGraph: {
    title: 'Ramadan Umrah Packages 2027 from the UK | PilgrimCompare',
    description:
      'Book your Ramadan Umrah 2027 with verified UK operators. Compare packages, hotel distance to Haram, and request a quote.',
    url: 'https://pilgrimcompare.co.uk/umrah/ramadan',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
}

const faqs = [
  {
    question: 'When is Ramadan 2027?',
    answer:
      'Ramadan 2027 is expected to begin around 18 February 2027 and end around 18 March 2027, subject to moon sighting confirmation. UK operators typically start listing packages 6–9 months in advance. Register interest to be notified when packages go live.',
  },
  {
    question: 'Why are Ramadan Umrah packages more expensive than off-peak?',
    answer:
      'Demand is significantly higher during Ramadan, especially in the final 10 nights. Hotels near the Grand Mosque charge premium rates and international flight capacity is limited. Expect to pay 30–50% more than equivalent off-peak packages. Booking early generally secures better availability and pricing.',
  },
  {
    question: 'What are the last 10 nights of Ramadan for Umrah?',
    answer:
      'The last 10 nights of Ramadan (Ashara Mubarakah) include Laylat al-Qadr, the Night of Power, considered the most spiritually significant night in the Islamic calendar. Many pilgrims aim to perform Umrah and remain in Makkah during this period. These packages sell out first and carry the highest prices.',
  },
  {
    question: 'Are Ramadan Umrah packages ATOL protected?',
    answer:
      "UK travel operators selling package holidays that include international flights and accommodation must hold ATOL (Air Travel Organiser's Licence) protection. Always verify the operator's ATOL number on the Civil Aviation Authority (CAA) website before booking. PilgrimCompare lists operators' protection status where provided.",
  },
]

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah/ramadan',
    name: 'Ramadan Umrah Packages 2027 from the UK | PilgrimCompare',
    description:
      'Compare Ramadan Umrah packages from verified UK operators for 2027. Hotels near the Grand Mosque, flights, ATOL protected.',
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah', path: '/umrah' },
    { name: 'Ramadan Umrah 2027', path: '/umrah/ramadan' },
  ]),
  faqPageJsonLd(faqs),
])

export default function RamadanUmrahPage() {
  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      <main className="min-h-screen bg-[var(--background)] px-4 py-12 md:py-20">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-6">
            Ramadan Umrah Packages from the UK 2027
          </h1>

          <p className="text-lg text-[var(--textMuted)] leading-relaxed mb-8">
            Performing Umrah during Ramadan is one of the most spiritually rewarding pilgrimages a Muslim can make. Packages for Ramadan 2027 from verified UK operators include return flights, hotels near the Grand Mosque in Makkah, Madinah accommodation, and visa arrangements. Compare operators side by side and request a quote before packages sell out.
          </p>

          {/* Ramadan 2027 dates — direct-answer block for AEO */}
          <section
            className="rounded-xl border border-[var(--yellow)]/20 bg-[var(--yellow)]/5 p-6 mb-8"
            aria-labelledby="ramadan-dates"
          >
            <h2 id="ramadan-dates" className="text-lg font-semibold text-[var(--text)] mb-3">
              Ramadan 2027 dates
            </h2>
            <p className="text-[var(--textMuted)] text-sm leading-relaxed">
              Ramadan 2027 is expected to run from approximately{' '}
              <strong className="text-[var(--text)]">18 February</strong> to{' '}
              <strong className="text-[var(--text)]">18 March 2027</strong>, subject to moon
              sighting. UK operators typically start listing packages from mid-2026. Register your
              interest to be notified as soon as packages go live.
            </p>
          </section>

          {/* What's included */}
          <section
            className="rounded-xl border border-[var(--border)] bg-[var(--surfaceDark)] p-6 md:p-8 mb-8"
            aria-labelledby="what-to-expect"
          >
            <h2 id="what-to-expect" className="text-xl font-semibold text-[var(--text)] mb-4">
              What to expect from a Ramadan Umrah package
            </h2>
            <ul className="space-y-3 text-[var(--textMuted)]">
              {[
                'Return flights from major UK airports — London, Birmingham, Manchester',
                'Hotels near the Grand Mosque in Makkah — verified star ratings and distances to Haram',
                'Madinah accommodation close to Masjid an-Nabawi',
                'Saudi Umrah visa assistance and airport transfers',
                'ATOL or ABTA protected operators — always verify status before booking',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-[var(--yellow)] font-bold mt-0.5">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Pricing note */}
          <section className="mb-8" aria-labelledby="ramadan-pricing">
            <h2 id="ramadan-pricing" className="text-lg font-semibold text-[var(--text)] mb-3">
              Ramadan Umrah package costs
            </h2>
            <p className="text-[var(--textMuted)] leading-relaxed mb-3 text-sm">
              Ramadan packages carry a 30–50% premium over off-peak departures due to high demand
              and limited hotel and flight capacity. Budget packages for Ramadan 2027 are expected
              to start from around <strong className="text-[var(--text)]">£1,200 per person</strong>
              ; mid-range 4-star options from <strong className="text-[var(--text)]">£2,000</strong>
              ; and premium 5-star stays near the Grand Mosque from{' '}
              <strong className="text-[var(--text)]">£3,500</strong>. Last-10-nights packages
              carry the highest premiums.
            </p>
            <Link href="/umrah/cost" className="text-sm text-[var(--yellow)] hover:underline">
              See full Umrah cost guide →
            </Link>
          </section>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Link
              href="/search/packages?type=umrah"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--yellow)] px-6 py-3 text-base font-semibold text-[var(--bg)] hover:opacity-90 transition-opacity"
            >
              Browse Umrah packages
            </Link>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-6 py-3 text-base font-medium text-[var(--text)] hover:border-[var(--yellow)]/40 transition-colors"
            >
              Request a custom Ramadan quote
            </Link>
          </div>

          <p className="text-sm text-[var(--textMuted)] mb-10">
            Ramadan 2027 package listings and availability depend on individual operators. Prices
            and inclusions vary. Confirm ATOL or ABTA status directly with the operator before
            booking.
          </p>

          {/* FAQ section */}
          <section aria-labelledby="ramadan-faq">
            <h2 id="ramadan-faq" className="text-lg font-semibold text-[var(--text)] mb-4">
              Frequently asked questions about Ramadan Umrah
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-4 py-3"
                >
                  <summary className="cursor-pointer text-sm font-medium text-[var(--text)]">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-sm text-[var(--textMuted)] leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Internal navigation */}
          <nav
            aria-label="Related Umrah pages"
            className="mt-10 pt-6 border-t border-[var(--border)]"
          >
            <p className="text-sm font-semibold text-[var(--textMuted)] uppercase tracking-wide mb-3">
              Compare by departure city
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Umrah from London', href: '/umrah/london' },
                { label: 'Umrah from Birmingham', href: '/umrah/birmingham' },
                { label: 'Umrah from Manchester', href: '/umrah/manchester' },
                { label: 'All Umrah packages', href: '/umrah' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-3 py-1.5 text-xs font-medium text-[var(--textMuted)] hover:text-[var(--text)] hover:border-[var(--yellow)]/40 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </article>
      </main>
    </>
  )
}
