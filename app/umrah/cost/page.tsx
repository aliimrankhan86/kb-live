import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLdScript, breadcrumbJsonLd, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'

export const metadata: Metadata = {
  title: 'How Much Does an Umrah Package Cost from the UK? 2026–2027 Guide',
  description:
    'Umrah packages from the UK start from around £800 per person. Compare budget, mid-range, and premium 5-star options. Full breakdown of what affects the price and what is included.',
  alternates: { canonical: '/umrah/cost' },
  openGraph: {
    title: 'Umrah Package Cost from the UK – Pricing Guide 2026–2027 | PilgrimCompare',
    description:
      'Compare Umrah package prices by hotel tier, travel season, and departure airport. Find out what is included and how to get the best value.',
    url: 'https://pilgrimcompare.co.uk/umrah/cost',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
}

const priceTiers = [
  { tier: 'Budget', price: '£800 – £1,200', hotel: '3-star', distance: '500m – 1km' },
  { tier: 'Mid-range', price: '£1,200 – £2,500', hotel: '4-star', distance: '200m – 500m' },
  { tier: 'Premium', price: '£2,500 – £5,000', hotel: '5-star', distance: '50m – 200m' },
  { tier: 'Luxury', price: '£5,000+', hotel: '5-star deluxe', distance: 'Under 50m' },
]

const included = [
  'Return flights from UK departure airport',
  'Hotel in Makkah (typically 7–10 nights)',
  'Hotel in Madinah (typically 3–4 nights)',
  'Airport transfers on arrival and departure',
  'Saudi Umrah visa costs',
  'Transport between Makkah and Madinah',
]

const faqs = [
  {
    question: 'What is the cheapest Umrah package from the UK?',
    answer:
      'Budget Umrah packages from the UK start from around £800–£1,000 per person for off-peak departures. These typically include return flights, 3-star hotels in Makkah and Madinah, transfers, and visa. Hotels may be 500m–1km from the Grand Mosque. Prices vary by operator, departure airport, and time of year.',
  },
  {
    question: 'Why do some Umrah packages cost more than others?',
    answer:
      'The biggest factor is hotel distance to the Grand Mosque in Makkah. A room within 100 metres of the Haram commands a significant premium over one 500 metres away. Hotel star rating, travel season (Ramadan and school holidays are more expensive), package duration, departure airport, and inclusions such as meals or guided tours also affect the price.',
  },
  {
    question: 'Are Umrah packages from the UK ATOL protected?',
    answer:
      "UK operators selling package holidays that include international flights and accommodation must hold ATOL (Air Travel Organiser's Licence) protection. ATOL protects your money if the operator collapses before or during your trip. Always verify the operator's ATOL number on the Civil Aviation Authority (CAA) website before booking.",
  },
  {
    question: 'When is the cheapest time to book Umrah from the UK?',
    answer:
      'Off-peak months — typically October to January, excluding Ramadan — offer the lowest Umrah package prices from the UK. Avoid school holidays (Easter, summer, Christmas) and Ramadan if cost is the primary consideration. Mid-week departures can also be slightly cheaper than weekend flights.',
  },
]

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah/cost',
    name: 'How Much Does an Umrah Package Cost from the UK? 2026–2027 Guide | PilgrimCompare',
    description:
      'Umrah packages from the UK start from around £800 per person. Compare budget, mid-range, and premium 5-star options with full pricing breakdown.',
    dateModified: '2026-06-06',
  }),
  breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Umrah', path: '/umrah' },
    { name: 'Umrah Cost Guide', path: '/umrah/cost' },
  ]),
  faqPageJsonLd(faqs),
])

export default async function UmrahCostPage() {
  const departureCities = await Repository.getDistinctDepartureCities()

  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      <main className="min-h-screen bg-[var(--background)] px-4 py-12 md:py-20">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-6">
            How Much Does an Umrah Package Cost from the UK?
          </h1>

          {/* Direct-answer lead — AEO optimised */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] p-4 mb-6">
            <p className="text-base text-[var(--textMuted)] leading-relaxed">
              <strong className="text-[var(--text)]">
                Umrah packages from the UK start from around £800 per person
              </strong>{' '}
              for budget off-peak departures. Mid-range 4-star packages average £1,200–£2,500,
              while premium 5-star packages with hotels adjacent to the Grand Mosque cost
              £2,500–£5,000+. Ramadan departures typically add 30–50% to the price.
            </p>
          </div>

          <p className="text-[var(--textMuted)] leading-relaxed mb-10">
            The exact cost depends on four main factors: hotel distance to the Grand Mosque, hotel
            star rating, travel season, and what is included in the package. This guide breaks down
            each tier so you can compare accurately before requesting a quote.
          </p>

          {/* Price tiers table */}
          <section className="mb-10" aria-labelledby="price-tiers">
            <h2 id="price-tiers" className="text-xl font-semibold text-[var(--text)] mb-4">
              Umrah package price tiers from the UK
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-[var(--surfaceDark)] border-b border-[var(--border)]">
                    <th className="px-4 py-3 font-semibold text-[var(--text)]">Tier</th>
                    <th className="px-4 py-3 font-semibold text-[var(--text)]">Price per person</th>
                    <th className="px-4 py-3 font-semibold text-[var(--text)]">Makkah hotel</th>
                    <th className="px-4 py-3 font-semibold text-[var(--text)] hidden sm:table-cell">
                      Distance to Haram
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {priceTiers.map(({ tier, price, hotel, distance }) => (
                    <tr
                      key={tier}
                      className="hover:bg-[var(--surfaceDark)]/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text)]">{tier}</td>
                      <td className="px-4 py-3 text-[var(--textMuted)]">{price}</td>
                      <td className="px-4 py-3 text-[var(--textMuted)]">{hotel}</td>
                      <td className="px-4 py-3 text-[var(--textMuted)] hidden sm:table-cell">
                        {distance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--textMuted)] mt-2">
              Indicative ranges for off-peak packages with return flights from a major UK airport.
              Ramadan and peak-season prices are higher.
            </p>
          </section>

          {/* What affects the price */}
          <section className="mb-10" aria-labelledby="price-factors">
            <h2 id="price-factors" className="text-xl font-semibold text-[var(--text)] mb-5">
              What affects the cost of an Umrah package?
            </h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-[var(--text)] mb-1">
                  Hotel distance to the Grand Mosque
                </h3>
                <p className="text-sm text-[var(--textMuted)] leading-relaxed">
                  This is the single biggest cost driver. A room within 100 metres of the Haram in
                  Makkah can cost three or four times more than an equivalent room 700 metres away.
                  Most pilgrims balance proximity with budget — 300–500 metres is a reasonable walk
                  for most travellers.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text)] mb-1">Travel season</h3>
                <p className="text-sm text-[var(--textMuted)] leading-relaxed">
                  Ramadan is the most expensive period — prices are typically 30–50% higher than
                  off-peak. UK school holidays (Easter, summer, and Christmas) add around 15–25%.
                  The lowest prices are generally October to January outside of Ramadan.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text)] mb-1">
                  Package duration
                </h3>
                <p className="text-sm text-[var(--textMuted)] leading-relaxed">
                  Standard packages run 10–14 nights — typically 7–10 in Makkah and 3–4 in
                  Madinah. Longer 21-night packages cost more in total but often offer better
                  per-night hotel rates. Shorter 7-night packages have lower headline prices but
                  less flexibility.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text)] mb-1">
                  Departure airport and airline
                </h3>
                <p className="text-sm text-[var(--textMuted)] leading-relaxed">
                  Packages from London Heathrow (LHR) or London Gatwick (LGW) often have more
                  flight options and competitive pricing. Departures from Birmingham (BHX) and
                  Manchester (MAN) can be cheaper for travellers in the Midlands or North. Indirect
                  routing via Dubai, Istanbul, or Doha is generally cheaper than direct flights to
                  Jeddah (JED).
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text)] mb-1">Inclusions</h3>
                <p className="text-sm text-[var(--textMuted)] leading-relaxed">
                  Most packages include return flights, hotel accommodation, airport transfers, and
                  Saudi Umrah visa. Some premium packages add meals, guided Ziyarat visits,
                  airport meet-and-greet, and 24/7 support. A lower headline price may exclude visa
                  fees or transfers — always compare total cost.
                </p>
              </div>
            </div>
          </section>

          {/* Seasonal guide */}
          <section
            className="rounded-xl border border-[var(--border)] bg-[var(--surfaceDark)] p-6 mb-10"
            aria-labelledby="seasonal-pricing"
          >
            <h2 id="seasonal-pricing" className="text-lg font-semibold text-[var(--text)] mb-3">
              Seasonal pricing at a glance
            </h2>
            <ul className="space-y-3 text-sm text-[var(--textMuted)]">
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold mt-0.5" aria-label="Highest prices">
                  ↑↑
                </span>
                <span>
                  <strong className="text-[var(--text)]">Ramadan (Feb/Mar 2027):</strong> Highest
                  prices — 30–50% premium, especially last 10 nights
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 font-bold mt-0.5" aria-label="Higher prices">
                  ↑
                </span>
                <span>
                  <strong className="text-[var(--text)]">UK school holidays:</strong> Easter,
                  summer, Christmas — 15–25% above standard rates
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-0.5" aria-label="Lowest prices">
                  ↓
                </span>
                <span>
                  <strong className="text-[var(--text)]">Off-peak (Oct–Jan, outside Ramadan):</strong>{' '}
                  Lowest prices — best value for budget-conscious pilgrims
                </span>
              </li>
            </ul>
          </section>

          {/* What's included */}
          <section className="mb-10" aria-labelledby="whats-included">
            <h2 id="whats-included" className="text-xl font-semibold text-[var(--text)] mb-4">
              What is typically included in a UK Umrah package?
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {included.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-[var(--textMuted)]">
                  <span aria-hidden="true" className="text-[var(--yellow)] font-bold mt-0.5">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--textMuted)] mt-4">
              Always confirm exactly what is included with the operator. Meals, guided tours, and
              travel insurance are usually optional extras.
            </p>
          </section>

          {/* CTA */}
          <section
            className="rounded-xl border border-[var(--yellow)]/20 bg-[var(--yellow)]/5 p-6 mb-10"
            aria-labelledby="compare-cta"
          >
            <h2 id="compare-cta" className="text-base font-semibold text-[var(--text)] mb-2">
              Ready to compare Umrah packages?
            </h2>
            <p className="text-sm text-[var(--textMuted)] mb-4">
              PilgrimCompare lets you compare packages side by side — prices, hotel ratings, distance to
              Haram, inclusions, and operator trust signals — before requesting a quote directly
              from the operator.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/umrah"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--yellow)] px-5 py-2.5 text-sm font-semibold text-[var(--bg)] hover:opacity-90 transition-opacity"
              >
                Compare Umrah packages
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-5 py-2.5 text-sm font-medium text-[var(--text)] hover:border-[var(--yellow)]/40 transition-colors"
              >
                Request a custom quote
              </Link>
            </div>
          </section>

          {/* FAQ section */}
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

          {/* Internal navigation */}
          <nav
            aria-label="Compare by departure city"
            className="mt-10 pt-6 border-t border-[var(--border)]"
          >
            <p className="text-sm font-semibold text-[var(--textMuted)] uppercase tracking-wide mb-3">
              Compare by departure city
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                ...departureCities.map((city) => ({ label: `Umrah from ${city}`, href: `/umrah/${city.toLowerCase()}` })),
                { label: 'Ramadan Umrah 2027', href: '/umrah/ramadan' },
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
