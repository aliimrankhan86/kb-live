import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPackagesClient } from '@/components/search/SearchPackagesClient';
import { filterByParams } from '@/components/search/search-utils';
import { Repository } from '@/lib/api/repository';
import type { Package as CataloguePackage } from '@/lib/types';
import { JsonLdScript, faqPageJsonLd, graphJsonLd, searchResultsJsonLd, webPageJsonLd } from '@/lib/seo/json-ld';
import { FEATURE_FEATURED_SLOTS } from '@/lib/config';
import styles from '@/components/search/packages.module.css';

/**
 * Load the catalogue, but never let a database blip turn the page into a hard
 * 500. On failure we return an empty list + an error flag so the page can show
 * a friendly "try again" notice instead. (Root cause of an outage is usually
 * DB connectivity — e.g. a paused Supabase project — not the page itself.)
 */
async function loadPackages(): Promise<{ packages: CataloguePackage[]; failed: boolean }> {
  try {
    return { packages: await Repository.listPackages(), failed: false };
  } catch (err) {
    console.error('[search/packages] Failed to load packages from the database:', err);
    return { packages: [], failed: true };
  }
}

interface SearchPackagesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const getStringParam = (params: Record<string, string | string[] | undefined>, key: string) => {
  const value = params[key];
  return typeof value === 'string' ? value : undefined;
};

const buildUrlParams = (params: Record<string, string | string[] | undefined>) =>
  new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => typeof v === 'string')
      .map(([k, v]) => [k, v as string])
  );

export async function generateMetadata({ searchParams }: SearchPackagesPageProps): Promise<Metadata> {
  const params = await searchParams;
  const type = getStringParam(params, 'type');
  const season = getStringParam(params, 'season');
  const { packages: allPackages } = await loadPackages();
  const count = filterByParams(allPackages, buildUrlParams(params)).length;
  const packageType = type === 'hajj' ? 'Hajj' : type === 'umrah' ? 'Umrah' : 'Hajj and Umrah';
  const seasonLabel = season && season !== 'flexible' ? ` ${season.replace('-', ' ')}` : '';

  return {
    title: `${count} ${packageType}${seasonLabel} Packages - Compare UK Operators`,
    description: `Compare ${count} ${packageType.toLowerCase()} packages by price, hotels, distance to Haram, inclusions, and operator trust signals.`,
    alternates: {
      canonical: '/search/packages',
    },
    openGraph: {
      title: `${packageType} Package Search Results | PilgrimCompare`,
      description: `Compare ${packageType.toLowerCase()} packages from UK operators with transparent package details.`,
      url: 'https://pilgrimcompare.co.uk/search/packages',
      siteName: 'PilgrimCompare',
      type: 'website',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${count} ${packageType}${seasonLabel} Packages | PilgrimCompare`,
      description: `Compare ${count} ${packageType.toLowerCase()} packages by price, hotels, distance to Haram, and inclusions.`,
    },
  };
}

export default async function SearchPackagesPage({ searchParams }: SearchPackagesPageProps) {
  const params = await searchParams;
  const { packages: allPackages, failed } = await loadPackages();

  // If the catalogue couldn't load (usually a database connectivity blip),
  // show a calm "try again" state rather than a 500.
  if (failed) {
    return (
      <main className={styles.searchPage}>
        <h1 className="sr-only">Search Results - Hajj and Umrah Packages</h1>
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
              This is usually a brief connection hiccup. Please refresh in a moment — your search
              is still saved in the address bar.
            </p>
            <a className={styles.emptyStateAction} href={`/search/packages?${buildUrlParams(params).toString()}`}>
              Try again
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Pre-filter server-side for SEO — count and JSON-LD use real package data.
  const urlParams = buildUrlParams(params);
  const initialFiltered = filterByParams(allPackages, urlParams);
  const type = urlParams.get('type');
  const packageType = type === 'hajj' ? 'Hajj' : type === 'umrah' ? 'Umrah' : 'Hajj and Umrah';
  const searchJsonLd = graphJsonLd([
    webPageJsonLd({
      path: '/search/packages',
      name: `${packageType} package search results`,
      description:
        'Search and compare Hajj and Umrah packages by price, operator, hotel proximity, inclusions, and travel preferences.',
    }),
    searchResultsJsonLd(initialFiltered, `${packageType} Packages`),
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
  ]);

  return (
    <>
      <JsonLdScript data={searchJsonLd} />
      <Suspense
        fallback={
          <main className={styles.searchPage}>
            <h1 className="sr-only">Search Results - Hajj and Umrah Packages</h1>
            <div className={styles.searchContainer}>
              <div className={styles.searchHeader}>
                <div className={styles.searchResults}>
                  Found {initialFiltered.length} packages matching your criteria
                </div>
              </div>
              {/* Non-interactive skeleton — avoids state loss when Suspense resolves */}
              <div aria-busy="true" aria-label="Loading packages">
                {initialFiltered.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="mb-4 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5 opacity-60"
                    aria-hidden="true"
                  >
                    <div className="h-5 w-40 rounded bg-[rgba(255,255,255,0.08)]" />
                    <div className="mt-3 h-4 w-24 rounded bg-[rgba(255,255,255,0.05)]" />
                  </div>
                ))}
              </div>
            </div>
          </main>
        }
      >
        <SearchPackagesClient allPackages={allPackages} featuredSlotsEnabled={FEATURE_FEATURED_SLOTS} />
      </Suspense>
    </>
  );
}
