import type { Metadata } from 'next'
import { PackagesBrowse } from '@/components/packages/PackagesBrowse'
import { JsonLdScript, graphJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'
import type { Package } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Browse Hajj & Umrah Packages | PilgrimCompare',
  description:
    'Browse and compare published Umrah and Hajj packages from verified UK operators. Filter by budget, hotel rating, departure city, and inclusions.',
  alternates: { canonical: '/packages' },
  openGraph: {
    title: 'Browse Hajj & Umrah Packages | PilgrimCompare',
    description:
      'Browse published Umrah and Hajj packages from verified UK operators. Filter and compare side by side.',
    url: 'https://pilgrimcompare.co.uk/packages',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Hajj & Umrah Packages | PilgrimCompare',
    description:
      'Browse published Umrah and Hajj packages from verified UK operators. Filter and compare side by side.',
  },
}

const pageJsonLd = graphJsonLd([
  webPageJsonLd({
    path: '/packages',
    name: 'Browse Hajj & Umrah Packages — PilgrimCompare',
    description:
      'Browse and compare published Umrah and Hajj packages from verified UK operators.',
  }),
])

export default async function PackagesPage() {
  let packages: Package[] = []
  let error: string | undefined

  try {
    packages = await Repository.listPackages()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load packages right now.'
  }

  return (
    <>
      <JsonLdScript data={pageJsonLd} />
      <main className="min-h-screen bg-[var(--background)]">
        <PackagesBrowse packages={packages} error={error} />
      </main>
    </>
  )
}
