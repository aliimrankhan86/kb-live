/**
 * JSON-LD structured data generators for KaabaTrip SEO.
 * Renders as `<script type="application/ld+json">` in page markup.
 */

import type { Package, OperatorProfile } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kaabatrip.com';

export interface BreadcrumbItem {
  name: string;
  path?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

const compact = <T>(items: Array<T | undefined | false | null>): T[] => items.filter(Boolean) as T[];

/** Package detail page — Product schema */
export function packageJsonLd(pkg: Package, operatorName: string): Record<string, unknown> {
  const nightsMakkah = pkg.nightsMakkah ?? Math.ceil((pkg.totalNights ?? 0) / 2);
  const nightsMadinah = pkg.nightsMadinah ?? Math.floor((pkg.totalNights ?? 0) / 2);
  const hotelMakkahStars = pkg.hotelMakkahStars ?? 0;
  const hotelMadinahStars = pkg.hotelMadinahStars ?? 0;
  const startDate = pkg.dateWindow?.start;
  const endDate = pkg.dateWindow?.end;
  const packageUrl = `${BASE_URL}/packages/${pkg.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${packageUrl}#product`,
    name: pkg.title,
    description: `${pkg.pilgrimageType} package – ${pkg.totalNights} nights (${nightsMakkah} Makkah, ${nightsMadinah} Madinah). Hotels: ${hotelMakkahStars}★ Makkah, ${hotelMadinahStars}★ Madinah.`,
    sku: pkg.id,
    image: compact([pkg.imageUrl, ...(pkg.images ?? [])]),
    brand: {
      '@type': 'Organization',
      name: operatorName,
    },
    offers: {
      '@type': 'Offer',
      url: packageUrl,
      priceCurrency: pkg.currency ?? 'GBP',
      price: String(pkg.pricePerPerson ?? 0),
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'TravelAgency',
        name: operatorName,
      },
      ...(startDate ? { validFrom: startDate } : {}),
      ...(endDate ? { validThrough: endDate } : {}),
    },
    category: 'Travel Package',
    url: packageUrl,
    additionalProperty: compact([
      {
        '@type': 'PropertyValue',
        name: 'Pilgrimage type',
        value: pkg.pilgrimageType,
      },
      {
        '@type': 'PropertyValue',
        name: 'Makkah nights',
        value: String(nightsMakkah),
      },
      {
        '@type': 'PropertyValue',
        name: 'Madinah nights',
        value: String(nightsMadinah),
      },
      pkg.departureAirport
        ? {
            '@type': 'PropertyValue',
            name: 'Departure airport',
            value: pkg.departureAirport,
          }
        : undefined,
      pkg.airline
        ? {
            '@type': 'PropertyValue',
            name: 'Airline',
            value: pkg.airline,
          }
        : undefined,
    ]),
  };
}

/** Operator profile page — TravelAgency schema */
export function operatorJsonLd(operator: OperatorProfile): Record<string, unknown> {
  const operatorUrl = operator.slug ? `${BASE_URL}/operators/${operator.slug}` : BASE_URL;
  const identifiers = compact([
    operator.atolNumber
      ? {
          '@type': 'PropertyValue',
          propertyID: 'ATOL',
          value: operator.atolNumber,
        }
      : undefined,
    operator.abtaMemberNumber
      ? {
          '@type': 'PropertyValue',
          propertyID: 'ABTA',
          value: operator.abtaMemberNumber,
        }
      : undefined,
    operator.companyRegistrationNumber
      ? {
          '@type': 'PropertyValue',
          propertyID: 'Company registration',
          value: operator.companyRegistrationNumber,
        }
      : undefined,
  ]);

  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${operatorUrl}#travelagency`,
    name: operator.companyName,
    url: operatorUrl,
    email: operator.contactEmail,
    description:
      operator.verificationStatus === 'verified'
        ? `Verified ${operator.pilgrimageTypesOffered?.join(' and ') ?? 'pilgrimage'} travel operator on KaabaTrip.`
        : `${operator.pilgrimageTypesOffered?.join(' and ') ?? 'Pilgrimage'} travel operator profile on KaabaTrip.`,
    ...(operator.contactPhone ? { telephone: operator.contactPhone } : {}),
    ...(operator.websiteUrl ? { sameAs: [operator.websiteUrl] } : {}),
    ...(operator.officeAddress
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: [operator.officeAddress.line1, operator.officeAddress.line2].filter(Boolean).join(', '),
            addressLocality: operator.officeAddress.city,
            postalCode: operator.officeAddress.postcode,
            addressCountry: operator.officeAddress.country,
          },
        }
      : {}),
    ...(operator.servingRegions?.length ? { areaServed: operator.servingRegions } : {}),
    ...(operator.departureAirports?.length
      ? {
          knowsAbout: operator.departureAirports.map((airport) => `Pilgrimage packages departing from ${airport}`),
        }
      : {}),
    ...(operator.yearsInBusiness != null
      ? { foundingDate: String(new Date().getFullYear() - operator.yearsInBusiness) }
      : {}),
    ...(identifiers.length ? { identifier: identifiers } : {}),
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
    '@id': `${BASE_URL}/search/packages#itemlist`,
    name: listName,
    description: 'Search results for Hajj and Umrah package comparison on KaabaTrip.',
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
    '@id': `${BASE_URL}/#organization`,
    name: 'KaabaTrip',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    description: 'Compare verified Hajj and Umrah packages from trusted UK travel operators.',
    areaServed: ['United Kingdom'],
    knowsAbout: ['Umrah packages', 'Hajj packages', 'ATOL travel protection', 'Pilgrimage travel comparison'],
  };
}

/** WebSite schema with search action */
export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    name: 'KaabaTrip',
    url: BASE_URL,
    publisher: { '@id': `${BASE_URL}/#organization` },
    inLanguage: 'en-GB',
  };
}

/** FAQPage schema for extractable answer blocks. */
export function faqPageJsonLd(items: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/** WebPage schema for public landing and search pages. */
export function webPageJsonLd({
  path,
  name,
  description,
}: {
  path: string;
  name: string;
  description: string;
}): Record<string, unknown> {
  const url = `${BASE_URL}${path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    publisher: { '@id': `${BASE_URL}/#organization` },
    inLanguage: 'en-GB',
  };
}

/** Combine related schema nodes in one JSON-LD graph. */
export function graphJsonLd(nodes: Record<string, unknown>[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.map(({ '@context': _context, ...node }) => node),
  };
}

/** Serialize JSON-LD to script tag string (for Server Components) */
export function jsonLdScript(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
