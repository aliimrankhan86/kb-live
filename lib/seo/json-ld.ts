/**
 * JSON-LD structured data generators for KaabaTrip SEO.
 * Renders as `<script type="application/ld+json">` in page `<head>`.
 */

import type { Package, OperatorProfile } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kaabatrip.com';

export interface BreadcrumbItem {
  name: string;
  path?: string;
}

/** Package detail page — Product schema */
export function packageJsonLd(pkg: Package, operatorName: string): Record<string, unknown> {
  const nightsMakkah = pkg.nightsMakkah ?? Math.ceil((pkg.totalNights ?? 0) / 2);
  const nightsMadinah = pkg.nightsMadinah ?? Math.floor((pkg.totalNights ?? 0) / 2);
  const hotelMakkahStars = pkg.hotelMakkahStars ?? 0;
  const hotelMadinahStars = pkg.hotelMadinahStars ?? 0;
  const startDate = pkg.dateWindow?.start ? new Date(pkg.dateWindow.start).toISOString() : undefined;
  const endDate = pkg.dateWindow?.end ? new Date(pkg.dateWindow.end).toISOString() : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pkg.title,
    description: `${pkg.pilgrimageType} package – ${pkg.totalNights} nights (${nightsMakkah} Makkah, ${nightsMadinah} Madinah). Hotels: ${hotelMakkahStars}★ Makkah, ${hotelMadinahStars}★ Madinah.`,
    brand: {
      '@type': 'Organization',
      name: operatorName,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: pkg.currency ?? 'GBP',
      price: String(pkg.pricePerPerson ?? 0),
      availability: 'https://schema.org/InStock',
      ...(startDate ? { validFrom: startDate } : {}),
      ...(endDate ? { validThrough: endDate } : {}),
    },
    category: 'Travel Package',
    url: `${BASE_URL}/packages/${pkg.slug}`,
  };
}

/** Operator profile page — TravelAgency schema */
export function operatorJsonLd(operator: OperatorProfile): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: operator.companyName,
    url: `${BASE_URL}/operators/${operator.slug}`,
    description: `Verified ${operator.pilgrimageTypesOffered?.join(' & ') ?? 'pilgrimage'} travel operator`,
    ...(operator.officeAddress?.country
      ? {
          address: {
            '@type': 'PostalAddress',
            addressCountry: operator.officeAddress.country,
          },
        }
      : {}),
    ...(operator.websiteUrl ? { sameAs: [operator.websiteUrl] } : {}),
  };
}

/** Search results page — ItemList schema */
export function searchResultsJsonLd(
  results: Array<{ slug: string; title: string }>,
  listName = 'Umrah Packages'
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: results.length,
    itemListElement: results.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}/packages/${r.slug}`,
      name: r.title,
    })),
  };
}

/** BreadcrumbList schema for any page */
export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${BASE_URL}${item.path}` } : {}),
    })),
  };
}

/** Organization schema for homepage */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KaabaTrip',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    description: 'Compare verified Hajj and Umrah packages from trusted UK travel operators.',
    sameAs: [],
  };
}

/** WebSite schema with search action */
export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KaabaTrip',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search/packages?type={{search_term_string}}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Serialize JSON-LD to script tag string (for Server Components) */
export function jsonLdScript(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}