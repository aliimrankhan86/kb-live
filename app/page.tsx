import type { Metadata } from 'next'
import { Hero } from '@/components/marketing/Hero'
import { ValueProps } from '@/components/marketing/ValueProps'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { TrustBlock } from '@/components/marketing/TrustBlock'
import { DepartureCities } from '@/components/marketing/DepartureCities'
import { FAQ } from '@/components/marketing/FAQ'
import { HomeCTA } from '@/components/marketing/HomeCTA'
import { Reveal } from '@/components/marketing/Reveal'
import { JsonLdScript, faqPageJsonLd, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { HOME_FAQS } from '@/lib/content-rules'
import { Repository } from '@/lib/api/repository'

const GUIDE_LINKS = [
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
  // Same source array as the visible <FAQ> below, so the markup is never orphaned.
  faqPageJsonLd(HOME_FAQS),
])

export default async function Home() {
  let departureCities: string[] = []
  try {
    departureCities = await Repository.getDistinctDepartureCities()
  } catch {
    // DB unavailable — the departure-cities section renders its honest empty state.
  }

  return (
    <>
      <JsonLdScript data={homeJsonLd} />
      <Hero />
      <Reveal>
        <ValueProps />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <TrustBlock />
      </Reveal>
      <Reveal>
        <DepartureCities cities={departureCities} guideLinks={GUIDE_LINKS} />
      </Reveal>
      <Reveal>
        <FAQ items={HOME_FAQS} />
      </Reveal>
      <Reveal>
        <HomeCTA />
      </Reveal>
    </>
  )
}
