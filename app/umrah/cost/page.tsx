import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'
import { isRfqQuoteEnabled } from '@/lib/config'
import { ATOL_STANDARD_LINE, PAYMENT_STANDARD_LINE } from '@/lib/content-rules'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

// A guide to what drives the price, not a price list. PilgrimCompare never
// states its own prices, ranges or percentages: only operators set prices, and
// we show them as stated (standards §6, §11). Comparative price claims are banned (§5).
const DESCRIPTION =
  'What affects the price of an Umrah package from the UK: hotels and distance to the Haram, travel dates, what is included and room sharing. Compare the prices operators state side by side.'

export const metadata: Metadata = {
  title: 'What Affects the Cost of an Umrah Package from the UK | PilgrimCompare',
  description: DESCRIPTION,
  alternates: { canonical: '/umrah/cost' },
  openGraph: {
    title: 'What Affects the Cost of an Umrah Package from the UK | PilgrimCompare',
    description: DESCRIPTION,
    url: 'https://pilgrimcompare.co.uk/umrah/cost',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
}

/** Corridor pages that exist; other departure cities have no page yet. */
const CORRIDOR_PAGES = new Set(['london', 'birmingham', 'manchester'])

const factors = [
  {
    title: 'Hotels and distance to the Haram',
    body: 'Hotels closer to the Haram in Makkah and the Prophet’s Mosque in Madinah usually cost more. Compare the hotel names and the distances each operator states.',
  },
  {
    title: 'Travel dates',
    body: 'Ramadan, school holidays and other busy periods usually cost more than quieter months. Compare packages for the same dates where you can.',
  },
  {
    title: 'What is included',
    body: 'Check whether flights, visa, transfers and meals are included. A lower headline price can leave out things another package includes.',
  },
  {
    title: 'Room sharing',
    body: 'Prices are usually per person and depend on how many people share a room. Check which room type the price is based on.',
  },
  {
    title: 'Nights in Makkah and Madinah',
    body: 'The total number of nights, and how they are split between the two cities, changes the price. Compare packages with a similar split.',
  },
]

const faqs = [
  {
    question: 'How much does an Umrah package from the UK cost?',
    answer:
      'Prices are set by each operator and depend on dates, hotels, what is included and room sharing. Compare the prices operators state side by side, and confirm the final price with the operator before paying.',
  },
  {
    question: 'What should the price include?',
    answer:
      'Check what the headline price covers: flights, visa, transfers, both hotels and meals. If something you need is not included or shows as "Not provided", ask the operator before you pay.',
  },
  {
    question: 'Are Umrah packages from the UK ATOL protected?',
    answer: ATOL_STANDARD_LINE,
  },
  {
    question: 'Who do I pay?',
    answer: PAYMENT_STANDARD_LINE,
  },
]

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah/cost',
    name: 'What Affects the Cost of an Umrah Package from the UK | PilgrimCompare',
    description: DESCRIPTION,
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah', path: '/umrah' },
    { name: 'Umrah Cost Guide', path: '/umrah/cost' },
  ]),
  faqPageJsonLd(faqs),
])

export default async function UmrahCostPage() {
  const departureCities = await Repository.getDistinctDepartureCities().catch(() => [] as string[])

  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      <main className="min-h-screen bg-[var(--background)] px-4 py-12 md:py-20">
        <article className="mx-auto max-w-3xl">
          <Breadcrumb
            className="mb-6"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Umrah', href: '/umrah' },
              { label: 'Cost guide' },
            ]}
          />
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-6">
            What Affects the Cost of an Umrah Package from the UK?
          </h1>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] p-4 mb-10">
            <p className="text-[var(--text)] leading-relaxed">
              Each operator sets its own prices. PilgrimCompare shows the price each operator
              states, so you can compare packages side by side. The main things that change the
              price are below.
            </p>
          </div>

          <section className="mb-10" aria-labelledby="price-factors">
            <h2 id="price-factors" className="text-xl font-semibold text-[var(--text)] mb-5">
              What affects the price
            </h2>
            <div className="space-y-5">
              {factors.map((f) => (
                <div key={f.title}>
                  <h3 className="text-base font-semibold text-[var(--text)] mb-1">{f.title}</h3>
                  <p className="text-sm text-[var(--textMuted)] leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10" aria-labelledby="before-you-pay">
            <h2 id="before-you-pay" className="text-xl font-semibold text-[var(--text)] mb-4">
              Before you pay
            </h2>
            <ul className="space-y-2 text-sm text-[var(--textMuted)] list-disc pl-5">
              <li>Confirm the final price, dates and hotels with the operator in writing.</li>
              <li>Ask what the deposit is, when the balance is due, and what the cancellation terms are.</li>
              <li>{ATOL_STANDARD_LINE}</li>
              <li>{PAYMENT_STANDARD_LINE}</li>
            </ul>
          </section>

          <section
            className="rounded-xl border border-[var(--border)] bg-[var(--surfaceDark)] p-6 mb-10"
            aria-labelledby="compare-cta"
          >
            <h2 id="compare-cta" className="text-lg font-semibold text-[var(--text)] mb-2">
              Compare Umrah packages
            </h2>
            <p className="text-sm text-[var(--textMuted)] mb-4">
              See prices, hotels, distance to the Haram and what is included side by side, as
              stated by each operator, then send an enquiry to the one you choose.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/search/packages?type=umrah"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--yellow)] px-5 py-2.5 text-sm font-semibold text-[var(--bg)] hover:opacity-90 transition-opacity"
              >
                Compare Umrah packages
              </Link>
              {/* PARKED: RFQ quote engine. CTA hidden when flag off (PARKED_FEATURES.md entry 2). */}
              {isRfqQuoteEnabled() && (
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-5 py-2.5 text-sm font-medium text-[var(--text)] hover:border-[var(--yellow)]/40 transition-colors"
                >
                  Request a custom quote
                </Link>
              )}
            </div>
          </section>

          <section aria-labelledby="cost-faq">
            <h2 id="cost-faq" className="text-lg font-semibold text-[var(--text)] mb-4">
              Frequently asked questions about Umrah costs
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

          <nav
            aria-label="Compare by departure city"
            className="mt-10 pt-6 border-t border-[var(--border)]"
          >
            <p className="text-sm font-semibold text-[var(--textMuted)] uppercase tracking-wide mb-3">
              Compare by departure city
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                ...departureCities
                  .filter((city) => CORRIDOR_PAGES.has(city.toLowerCase()))
                  .map((city) => ({ label: `Umrah from ${city}`, href: `/umrah/${city.toLowerCase()}` })),
                { label: 'Ramadan Umrah', href: '/umrah/ramadan' },
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
