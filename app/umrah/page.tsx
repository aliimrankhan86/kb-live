import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { UmrahSearchForm } from '@/components/umrah/UmrahSearchForm'
import { faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'

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
]

const umrahJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/umrah',
    name: 'Umrah Packages 2026 from the UK',
    description:
      'Compare UK Umrah packages by travel dates, budget, hotel rating, distance to Haram, and operator trust signals.',
  }),
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
          <div className="mt-4 grid gap-4 text-sm text-[var(--textMuted)] md:grid-cols-3">
            {umrahFaqs.map((item) => (
              <article key={item.question}>
                <h3 className="font-semibold text-[var(--text)]">{item.question}</h3>
                <p className="mt-2">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
