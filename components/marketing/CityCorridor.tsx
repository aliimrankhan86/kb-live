import { Header } from '@/components/layout/Header'
import Link from 'next/link'

interface CityCorridorProps {
  city: string
  region: string
  metaTitle: string
  metaDescription: string
  h1: string
  intro: string
  queryParams: string
}

export function CityCorridor({
  city,
  h1,
  intro,
  queryParams,
}: CityCorridorProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen px-4 py-12 md:py-20">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            {h1}
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            {intro}
          </p>

          <section className="bg-slate-50 border border-slate-200 rounded-lg p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-3">
              What to expect
            </h2>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-emerald-600 font-bold">✓</span>
                <span>Verified UK operators with ATOL or ABTA protection</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-emerald-600 font-bold">✓</span>
                <span>Compare packages side by side — max 3 at a time</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-emerald-600 font-bold">✓</span>
                <span>Hotels near Haram, flights, transfers, and visa support</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true" className="text-emerald-600 font-bold">✓</span>
                <span>Request a quote or book directly with the operator</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-slate-500">
              KaabaTrip does not collect customer funds. You pay the operator directly.
            </p>
          </section>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/search/packages${queryParams}`}
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-6 py-3 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
              data-testid={`corridor-cta-${city.toLowerCase()}`}
            >
              Browse Umrah packages from {city}
            </Link>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
            >
              Request a custom quote
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Packages and availability are set by individual operators.
            Prices and inclusions vary. Always confirm details directly with your chosen operator.
          </p>
        </article>
      </main>
    </>
  )
}