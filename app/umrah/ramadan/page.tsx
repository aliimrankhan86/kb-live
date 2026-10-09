import type { Metadata } from 'next'
import { departureCityHref } from '@/lib/airports'
import Link from 'next/link'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'
import { isRfqQuoteEnabled } from '@/lib/config'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { ATOL_STANDARD_LINE, PAYMENT_STANDARD_LINE } from '@/lib/content-rules'

const DESCRIPTION =
  'Compare Ramadan Umrah packages from verified UK operators side by side: price, dates, hotels, distance to the Haram and inclusions, as stated by each operator.'

export const metadata: Metadata = {
  title: 'Ramadan Umrah Packages from the UK',
  description: DESCRIPTION,
  alternates: { canonical: '/umrah/ramadan' },
  openGraph: {
    title: 'Ramadan Umrah Packages from the UK | PilgrimCompare',
    description: DESCRIPTION,
    url: 'https://pilgrimcompare.co.uk/umrah/ramadan',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
}

// No dates, prices, price premiums or availability claims: PilgrimCompare
// cannot check them (standards §6, §11). Dates and prices come from operators.
const faqs = [
  {
    question: 'When is Ramadan?',
    answer:
      'Ramadan follows the Islamic lunar calendar, so it starts about 11 days earlier each year and its exact dates are confirmed by moon sighting. Check the travel dates each operator gives for its Ramadan packages.',
  },
  {
    question: 'How much does a Ramadan Umrah package cost?',
    answer:
      'Prices are set by each operator and depend on dates, hotels and what is included. Compare the prices operators state, and confirm the final price with the operator before paying.',
  },
  {
    question: 'What are the last 10 nights of Ramadan?',
    answer:
      'The last 10 nights of Ramadan include Laylat al-Qadr, the Night of Power. Some packages are planned around these nights; check the dates and nights in Makkah each operator states.',
  },
  {
    question: 'Are Ramadan Umrah packages ATOL protected?',
    answer: ATOL_STANDARD_LINE,
  },
]

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah/ramadan',
    name: 'Ramadan Umrah Packages from the UK | PilgrimCompare',
    description: DESCRIPTION,
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah', path: '/umrah' },
    { name: 'Ramadan Umrah', path: '/umrah/ramadan' },
  ]),
  faqPageJsonLd(faqs),
])

export default async function RamadanUmrahPage() {
  const departureCities = await Repository.getDistinctDepartureCities().catch(() => [] as string[])
  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      <div className="min-h-screen bg-[var(--background)] px-4 py-12 md:py-20">
        <article className="mx-auto max-w-3xl">
          <Breadcrumb
            className="mb-6"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Umrah', href: '/umrah' },
              { label: 'Ramadan Umrah' },
            ]}
          />
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-6">
            Ramadan Umrah Packages from the UK
          </h1>

          <p className="text-lg text-[var(--textMuted)] leading-relaxed mb-8">
            Compare Ramadan Umrah packages from verified UK operators side by side. Each package
            shows what its operator states: price, travel dates, nights in Makkah and Madinah,
            hotels, distance to the Haram and what is included. Anything an operator has not
            given shows as &ldquo;Not provided&rdquo;.
          </p>

          <section
            className="rounded-xl border border-[var(--border)] bg-[var(--surfaceDark)] p-6 md:p-8 mb-8"
            aria-labelledby="what-to-check"
          >
            <h2 id="what-to-check" className="text-xl font-semibold text-[var(--text)] mb-4">
              What to check in a Ramadan Umrah package
            </h2>
            <ul className="space-y-3 text-[var(--textMuted)]">
              {[
                'Travel dates and how many nights fall in the last 10 nights, if that matters to you',
                'Nights in Makkah and Madinah, and each hotel with its distance to the Haram',
                'Whether flights, visa and transfers are included',
                'The deposit, payment terms and cancellation policy',
                'The operator\'s ATOL number',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-[var(--yellow)] font-bold mt-0.5">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-[var(--textMuted)]">{ATOL_STANDARD_LINE}</p>
          </section>

          <section className="mb-8" aria-labelledby="ramadan-pricing">
            <h2 id="ramadan-pricing" className="text-lg font-semibold text-[var(--text)] mb-3">
              Ramadan Umrah package costs
            </h2>
            <p className="text-[var(--textMuted)] leading-relaxed mb-3 text-sm">
              Prices are set by each operator. Compare the prices operators state for the same
              dates and hotels, and confirm the final price with the operator before paying.
            </p>
            <Link href="/umrah/cost" className="text-sm text-[var(--yellow)] hover:underline">
              See the Umrah cost guide →
            </Link>
          </section>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Link
              href="/packages?type=umrah&season=ramadan"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--yellow)] px-6 py-3 text-base font-semibold text-[var(--bg)] hover:opacity-90 transition-opacity"
            >
              Browse Umrah packages
            </Link>
            {/* PARKED: RFQ quote engine — CTA hidden when flag off (PARKED_FEATURES.md entry 2). */}
            {isRfqQuoteEnabled() && (
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-6 py-3 text-base font-medium text-[var(--text)] hover:border-[var(--yellow)]/40 transition-colors"
              >
                Request a custom Ramadan quote
              </Link>
            )}
          </div>

          <p className="text-sm text-[var(--textMuted)] mb-10">
            {PAYMENT_STANDARD_LINE}
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
                  <summary className="cursor-pointer py-3 text-sm font-medium text-[var(--text)]">
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
                ...departureCities.map((city) => ({ label: `Umrah from ${city}`, href: departureCityHref(city) })),
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
      </div>
    </>
  )
}
