import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/marketing/Hero'
import { faqPageJsonLd, graphJsonLd, organizationJsonLd, webPageJsonLd, websiteJsonLd } from '@/lib/seo/json-ld'

export const metadata: Metadata = {
  title: 'KaabaTrip - Compare Hajj & Umrah Packages from UK Operators',
  description:
    'Compare Hajj and Umrah packages from UK travel operators. Review prices, hotels near Haram, inclusions, ATOL/ABTA details, and operator profiles before requesting a quote.',
  keywords: ['Umrah packages UK', 'Hajj packages UK', 'compare Umrah packages', 'ATOL Umrah operators'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KaabaTrip - Compare Hajj & Umrah Packages',
    description:
      'Search and compare pilgrimage packages with transparent prices, hotel details, inclusions, and UK operator trust signals.',
    url: 'https://kaabatrip.com/',
    siteName: 'KaabaTrip',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KaabaTrip - Compare Hajj & Umrah Packages',
    description:
      'Compare UK Hajj and Umrah packages by price, hotels, inclusions, and operator trust signals.',
  },
}

const homeJsonLd = graphJsonLd([
  organizationJsonLd(),
  websiteJsonLd(),
  webPageJsonLd({
    path: '/',
    name: 'KaabaTrip - Compare Hajj and Umrah Packages',
    description:
      'KaabaTrip helps UK travellers compare Hajj and Umrah packages by price, hotel proximity, inclusions, and operator trust signals.',
  }),
  faqPageJsonLd([
    {
      question: 'What does KaabaTrip compare?',
      answer:
        'KaabaTrip compares Hajj and Umrah packages by price, departure route, hotel details, inclusions, nights split, and visible operator trust signals such as verification, ATOL, and ABTA details where provided.',
    },
    {
      question: 'Does KaabaTrip take payment for packages?',
      answer:
        'KaabaTrip records booking intent and helps travellers compare operators. Package payment is made directly to the travel operator, and travellers should use the KaabaTrip reference when paying.',
    },
  ]),
])

export default function Home() {
  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Hero />
    </>
  )
}
