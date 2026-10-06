/**
 * JSON-LD structured data generators for PilgrimCompare SEO.
 * Renders as `<script type="application/ld+json">` in page markup.
 */

import type { Package, OperatorProfile } from '@/lib/types';
import { createElement, type ReactElement } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pilgrimcompare.co.uk';

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
  // Stored nights only; the split is omitted when the operator did not give it
  // (never derived from totalNights — data-integrity rule).
  const split = pkg.nightsMakkah > 0 && pkg.nightsMadinah > 0
    ? ` (${pkg.nightsMakkah} Makkah, ${pkg.nightsMadinah} Madinah)`
    : '';
  // Operator-supplied star ratings only. When absent they are omitted from the
  // schema entirely — never emitted as 0 or a default (data-integrity rule).
  const hasMakkahStars = typeof pkg.hotelMakkahStars === 'number';
  const hasMadinahStars = typeof pkg.hotelMadinahStars === 'number';
  const hotelStarsParts = [
    hasMakkahStars ? `${pkg.hotelMakkahStars}★ Makkah` : null,
    hasMadinahStars ? `${pkg.hotelMadinahStars}★ Madinah` : null,
  ].filter(Boolean);
  const hotelDescription = hotelStarsParts.length ? ` Hotels: ${hotelStarsParts.join(', ')}.` : '';
  const packageUrl = `${BASE_URL}/packages/${pkg.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${packageUrl}#product`,
    name: pkg.title,
    description: `${pkg.pilgrimageType} package, ${pkg.totalNights} nights${split}.${hotelDescription}`,
    sku: pkg.id,
    image: compact([...(pkg.images ?? [])]),
    brand: {
      '@type': 'Organization',
      name: operatorName,
    },
    offers: {
      '@type': 'Offer',
      url: packageUrl,
      priceCurrency: pkg.currency,
      // Operator's stated price only. No availability claim (standards §3.5)
      // and no validity window: travel dates are not an offer validity period.
      ...(pkg.pricePerPerson > 0 ? { price: String(pkg.pricePerPerson) } : {}),
      seller: {
        '@type': 'TravelAgency',
        name: operatorName,
      },
    },
    category: 'Travel Package',
    url: packageUrl,
    additionalProperty: compact([
      {
        '@type': 'PropertyValue',
        name: 'Pilgrimage type',
        value: pkg.pilgrimageType,
      },
      pkg.nightsMakkah > 0 ? { '@type': 'PropertyValue', name: 'Makkah nights', value: String(pkg.nightsMakkah) } : null,
      pkg.nightsMadinah > 0 ? { '@type': 'PropertyValue', name: 'Madinah nights', value: String(pkg.nightsMadinah) } : null,
      hasMakkahStars
        ? {
            '@type': 'PropertyValue',
            name: 'Makkah hotel rating',
            value: String(pkg.hotelMakkahStars),
          }
        : undefined,
      hasMadinahStars
        ? {
            '@type': 'PropertyValue',
            name: 'Madinah hotel rating',
            value: String(pkg.hotelMadinahStars),
          }
        : undefined,
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
        ? `Verified ${operator.pilgrimageTypesOffered?.join(' and ') ?? 'pilgrimage'} travel operator on PilgrimCompare.`
        : `${operator.pilgrimageTypesOffered?.join(' and ') ?? 'Pilgrimage'} travel operator profile on PilgrimCompare.`,
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
    description: 'Search results for Hajj and Umrah package comparison on PilgrimCompare.',
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
    name: 'PilgrimCompare',
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
    name: 'PilgrimCompare',
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
  dateModified,
}: {
  path: string;
  name: string;
  description: string;
  /** ISO 8601 date string — surfaces freshness signal in AI and search results. */
  dateModified?: string;
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
    ...(dateModified ? { dateModified } : {}),
  };
}

export interface PersonData {
  name: string;
  url?: string;
  sameAs?: string[];
  jobTitle?: string;
  description?: string;
}

/** Person schema for E-E-A-T author attribution and entity disambiguation. */
export function personJsonLd({ name, url, sameAs, jobTitle, description }: PersonData): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    ...(url ? { url } : {}),
    ...(sameAs?.length ? { sameAs } : {}),
    ...(jobTitle ? { jobTitle } : {}),
    ...(description ? { description } : {}),
  };
}

/**
 * TouristTrip schema for pilgrimage package pages.
 * Use alongside `packageJsonLd` inside `graphJsonLd` — adds itinerary, destination,
 * and traveller-type signals that help AI engines classify and cite the package.
 */
export function touristTripJsonLd(pkg: Package, operatorName: string): Record<string, unknown> {
  const packageUrl = `${BASE_URL}/packages/${pkg.slug}`;
  const nightsMakkah = pkg.nightsMakkah;
  const nightsMadinah = pkg.nightsMadinah;
  const split = nightsMakkah > 0 && nightsMadinah > 0 ? ` (${nightsMakkah} in Makkah, ${nightsMadinah} in Madinah)` : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${packageUrl}#touristtrip`,
    name: pkg.title,
    description: `${pkg.pilgrimageType === 'hajj' ? 'Hajj' : 'Umrah'} package from the UK, ${pkg.totalNights} nights${split}.`,
    url: packageUrl,
    touristType: {
      '@type': 'Audience',
      audienceType: 'Muslim pilgrims from the United Kingdom',
    },
    provider: {
      '@type': 'TravelAgency',
      name: operatorName,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: pkg.currency,
      ...(pkg.pricePerPerson > 0 ? { price: String(pkg.pricePerPerson) } : {}),
      url: packageUrl,
    },
    itinerary: compact([
      nightsMakkah > 0
        ? { '@type': 'TouristDestination', name: 'Makkah', description: `${nightsMakkah} nights in Makkah` }
        : null,
      nightsMadinah > 0
        ? { '@type': 'TouristDestination', name: 'Madinah', description: `${nightsMadinah} nights in Madinah` }
        : null,
    ]),
    ...(pkg.dateWindow?.start ? { startDate: pkg.dateWindow.start } : {}),
    ...(pkg.dateWindow?.end ? { endDate: pkg.dateWindow.end } : {}),
    ...(pkg.departureAirport ? { departureLocation: { '@type': 'Airport', name: pkg.departureAirport } } : {}),
  };
}

/** Combine related schema nodes in one JSON-LD graph. */
export function graphJsonLd(nodes: Record<string, unknown>[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.map(({ '@context': _context, ...node }) => node),
  };
}

export async function JsonLdScript({ data }: { data: Record<string, unknown> }): Promise<ReactElement> {
  const { headers } = await import('next/headers');
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return createElement('script', {
    type: 'application/ld+json',
    nonce,
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}
