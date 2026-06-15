import Link from 'next/link'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { isRfqQuoteEnabled } from '@/lib/config'

interface FAQ {
  question: string
  answer: string
}

interface CityCorridorProps {
  city: string
  h1: string
  intro: string
  queryParams: string
  faqs?: FAQ[]
  breadcrumbItems?: BreadcrumbItem[]
}

export function CityCorridor({ city, h1, intro, queryParams, faqs, breadcrumbItems }: CityCorridorProps) {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 md:py-20">
      <article className="mx-auto max-w-3xl">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumb items={breadcrumbItems} className="mb-6" />
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-6">{h1}</h1>

        <p className="text-lg text-[var(--textMuted)] leading-relaxed mb-8">{intro}</p>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surfaceDark)] p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-4">What to expect</h2>
          <ul className="space-y-3 text-[var(--textMuted)]">
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-[var(--yellow)] font-bold mt-0.5">✓</span>
              <span>Verified UK operators with ATOL or ABTA protection</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-[var(--yellow)] font-bold mt-0.5">✓</span>
              <span>Compare packages side by side — up to 3 at a time</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-[var(--yellow)] font-bold mt-0.5">✓</span>
              <span>Hotels near Haram in Makkah and Madinah, flights, transfers, and visa support</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-[var(--yellow)] font-bold mt-0.5">✓</span>
              <span>Request a quote or book directly with the operator — PilgrimCompare does not hold your money</span>
            </li>
          </ul>
        </section>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Link
            href={`/search/packages${queryParams}`}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--yellow)] px-6 py-3 text-base font-semibold text-[var(--bg)] hover:opacity-90 transition-opacity"
            data-testid={`corridor-cta-${city.toLowerCase()}`}
          >
            Browse Umrah packages from {city}
          </Link>
          {/* PARKED: RFQ quote engine — CTA hidden when flag off (PARKED_FEATURES.md entry 2). */}
          {isRfqQuoteEnabled() && (
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surfaceDark)] px-6 py-3 text-base font-medium text-[var(--text)] hover:border-[var(--yellow)]/40 transition-colors"
            >
              Request a custom quote
            </Link>
          )}
        </div>

        <p className="text-sm text-[var(--textMuted)] mb-10">
          Packages and availability are set by individual operators. Prices and inclusions vary.
          Always confirm details directly with your chosen operator.
        </p>

        {faqs && faqs.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
              Frequently asked questions
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
        )}
      </article>
    </main>
  )
}
