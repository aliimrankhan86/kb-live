import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchPackagesClient } from '@/components/search/SearchPackagesClient'
import { filterByParams } from '@/components/search/search-utils'
import { JsonLdScript, faqPageJsonLd, graphJsonLd, searchResultsJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { Repository } from '@/lib/api/repository'
import { FEATURE_FEATURED_SLOTS } from '@/lib/config'
import type { OperatorProfile, Package } from '@/lib/types'
import styles from '@/components/search/packages.module.css'

// UX-08: the one package list. Search, browse, filters, close matches and
// compare all live here; /search/packages answers 308 to this page.
export const metadata: Metadata = {
  title: 'Browse Hajj & Umrah Packages',
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

type SearchParams = Record<string, string | string[] | undefined>

const toUrlParams = (params: SearchParams) =>
  new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => typeof v === 'string')
      .map(([k, v]) => [k, v as string])
  )

export default async function PackagesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const urlParams = toUrlParams(params)
  let packages: Package[] = []
  let operators: OperatorProfile[] = []
  let failed = false

  try {
    // Names render on the server; a failure only loses the trust line, never the page.
    ;[packages, operators] = await Promise.all([
      Repository.listPackages(),
      Repository.listPublicOperators().catch(() => []),
    ])
  } catch (err) {
    // Internal error detail stays in the server log, never on the page.
    console.error('[packages] Failed to load packages from the database:', err)
    failed = true
  }

  const compare = urlParams.get('compare')
  const initialFiltered = filterByParams(packages, urlParams)
  const pageJsonLd = graphJsonLd([
    webPageJsonLd({
      path: '/packages',
      name: 'Browse Hajj & Umrah Packages | PilgrimCompare',
      description:
        'Browse and compare published Umrah and Hajj packages from verified UK operators.',
    }),
    searchResultsJsonLd(initialFiltered, 'Hajj and Umrah Packages'),
    faqPageJsonLd([
      {
        question: 'What can I compare in PilgrimCompare package search results?',
        answer:
          'You can compare package price, operator, verification status, ATOL details where listed, hotel names, hotel ratings, distance to Haram, nights split, flights, transfers, meals, and cancellation notes where provided.',
      },
      {
        question: 'Why do some package fields say not provided?',
        answer:
          'PilgrimCompare shows missing package details clearly rather than hiding them. Travellers should confirm final itinerary, availability, inclusions, and payment terms with the travel operator.',
      },
    ]),
  ])

  return (
    <div className="min-h-screen" data-plain-background data-testid="packages-page">
      <JsonLdScript data={pageJsonLd} />
      {/* The only h1, outside the Suspense boundary. */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Browse packages</h1>
        <p className={styles.pageSubtitle}>
          Compare published Umrah and Hajj packages from verified UK operators, side by side, at no
          cost to you.
        </p>
      </header>
      {failed ? (
        // A database blip shows a calm "try again" state, never a 500.
        <div className={styles.searchPage}>
          <div className={styles.searchContainer}>
            <div className={styles.emptyState} role="alert">
              <div className={styles.emptyStateIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <h2 className={styles.emptyStateTitle}>We couldn&apos;t load packages right now</h2>
              <p className={styles.emptyStateText}>
                This is usually a brief connection hiccup. Please refresh in a moment. Your search
                is still saved in the address bar.
              </p>
              <a className={styles.emptyStateAction} href={`/packages?${urlParams.toString()}`}>
                Try again
              </a>
            </div>
          </div>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className={styles.searchPage}>
              <div className={styles.searchContainer}>
                <div className={styles.searchHeader}>
                  <div className={styles.searchResults}>
                    Found {initialFiltered.length} packages matching your criteria
                  </div>
                </div>
                {/* Non-interactive skeleton: avoids state loss when Suspense resolves */}
                <div aria-busy="true" aria-label="Loading packages">
                  {initialFiltered.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="mb-4 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5 opacity-60"
                      aria-hidden="true"
                    >
                      <div className="h-5 w-40 rounded bg-[var(--borderSubtle)]" />
                      <div className="mt-3 h-4 w-24 rounded bg-[var(--color-surface-subtle)]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <SearchPackagesClient
            allPackages={packages}
            featuredSlotsEnabled={FEATURE_FEATURED_SLOTS}
            operators={operators}
            initialCompareIds={packages.some((p) => p.id === compare) ? [compare as string] : []}
          />
        </Suspense>
      )}
    </div>
  )
}
