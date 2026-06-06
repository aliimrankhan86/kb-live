import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchPackagesClient } from '@/components/search/SearchPackagesClient';
import { filterByParams, toSearchDisplay } from '@/components/search/search-utils';
import { Repository } from '@/lib/api/repository';
import PackageList from '@/components/search/PackageList';
import { faqPageJsonLd, graphJsonLd, searchResultsJsonLd, webPageJsonLd } from '@/lib/seo/json-ld';
import styles from '@/components/search/packages.module.css';

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
  const allPackages = await Repository.listPackages();
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
      title: `${packageType} Package Search Results | KaabaTrip`,
      description: `Compare ${packageType.toLowerCase()} packages from UK operators with transparent package details.`,
      url: 'https://kaabatrip.com/search/packages',
      siteName: 'KaabaTrip',
      type: 'website',
      locale: 'en_GB',
    },
  };
}

export default async function SearchPackagesPage({ searchParams }: SearchPackagesPageProps) {
  const params = await searchParams;
  const allPackages = await Repository.listPackages();

  // Pre-filter server-side for SEO — initial HTML contains real package data.
  const urlParams = buildUrlParams(params);
  const initialFiltered = filterByParams(allPackages, urlParams);
  const initialDisplay = initialFiltered.map(toSearchDisplay);
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
        question: 'What can I compare in KaabaTrip package search results?',
        answer:
          'You can compare package price, operator, verification status, ATOL details where listed, hotel names, hotel ratings, distance to Haram, nights split, flights, transfers, meals, and cancellation notes where provided.',
      },
      {
        question: 'Why do some package fields say not provided?',
        answer:
          'KaabaTrip shows missing package details clearly rather than hiding them. Travellers should confirm final itinerary, availability, inclusions, and payment terms with the travel operator.',
      },
    ]),
  ]);

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchJsonLd) }}
      />
      <Suspense
        fallback={
          <main className={styles.searchPage}>
            <h1 className="sr-only">Search Results - Hajj and Umrah Packages</h1>
            <PackageList packages={initialDisplay} cataloguePackages={initialFiltered} />
          </main>
        }
      >
        <SearchPackagesClient allPackages={allPackages} />
      </Suspense>
    </>
  );
}
