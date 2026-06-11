/**
 * Pure search utilities — NO 'use client' directive.
 * Safe to import from both Server Components and Client Components.
 */

import type { Package as CataloguePackage } from '@/lib/types';
import { parseAirportCode } from '@/lib/airports';

export interface SearchFlightSegment {
  date: string;
  duration: string;
  route: string;
}

export interface SearchHotel {
  name: string;
  location: string;
  rating: number;
  distance: string;
  image: string;
}

export interface SearchPackageDisplay {
  id: string;
  slug?: string;
  departure: SearchFlightSegment;
  return: SearchFlightSegment;
  makkahHotel: SearchHotel;
  madinaHotel: SearchHotel;
  price: number;
  currency: string;
  priceNote: string;
}

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTIwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjx0ZXh0IHg9IjYwIiB5PSI0MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SG90ZWwgSW1hZ2U8L3RleHQ+PC9zdmc+';

const SEASON_QUERY_TO_LABELS: Record<string, string[]> = {
  ramadan: ['Ramadan', 'ramadan'],
  'school-holidays': ['Christmas', 'Easter', 'School Holidays', 'school-holidays', 'Hajj'],
  flexible: [],
};

export function filterByParams(
  packages: CataloguePackage[],
  params: { get(key: string): string | null }
): CataloguePackage[] {
  let next = [...packages];

  const type = params.get('type');
  if (type === 'umrah' || type === 'hajj') {
    next = next.filter((p) => p.pilgrimageType === type);
  }

  const season = params.get('season');
  if (season) {
    const s = season.toLowerCase();
    const labels = SEASON_QUERY_TO_LABELS[s];
    if (labels && labels.length > 0) {
      const set = new Set(labels.map((l) => l.toLowerCase()));
      next = next.filter((p) => set.has((p.seasonLabel ?? '').toLowerCase()));
    } else if (s !== 'flexible') {
      next = next.filter((p) => (p.seasonLabel?.toLowerCase() ?? '').includes(s));
    }
  }

  const budgetMin = params.get('budgetMin');
  const budgetMax = params.get('budgetMax');
  const minNum = budgetMin != null && budgetMin !== '' ? Number(budgetMin) : NaN;
  const maxNum = budgetMax != null && budgetMax !== '' ? Number(budgetMax) : NaN;
  if (Number.isFinite(minNum)) next = next.filter((p) => p.pricePerPerson >= minNum);
  if (Number.isFinite(maxNum)) {
    const afterMax = next.filter((p) => p.pricePerPerson <= maxNum);
    if (afterMax.length > 0) next = afterMax;
  }

  const hotelStars = params.get('hotelStars');
  if (hotelStars) {
    const selectedStars = hotelStars
      .split(',')
      .map((value) => Number(value))
      .filter((value) => [3, 4, 5].includes(value));

    if (selectedStars.length > 0) {
      const selected = new Set(selectedStars);
      next = next.filter((p) => {
        const makkahStars = p.hotelMakkahStars;
        const madinahStars = p.hotelMadinahStars;
        return (
          (typeof makkahStars === 'number' && selected.has(makkahStars)) ||
          (typeof madinahStars === 'number' && selected.has(madinahStars))
        );
      });
    }
  }

  const departureAirport = parseAirportCode(params.get('departureAirport'));
  if (departureAirport) {
    next = next.filter((p) => p.departureAirport === departureAirport);
  }

  // Distance to the Haram — distance bands map to representative metres so a
  // metre-based slider can filter the near/medium/far data honestly.
  const maxDistance = Number(params.get('maxDistance'));
  if (Number.isFinite(maxDistance) && maxDistance > 0) {
    next = next.filter((p) => {
      const closest = Math.min(
        DISTANCE_BAND_METERS[p.distanceBandMakkah] ?? Infinity,
        DISTANCE_BAND_METERS[p.distanceBandMadinah] ?? Infinity
      );
      return closest <= maxDistance;
    });
  }

  // Direct flights only.
  if (params.get('flightType') === 'direct') {
    next = next.filter((p) => p.flightType === 'direct');
  }

  return next;
}

// Representative metres for each distance band — used so a continuous slider can
// filter banded distance data. Tuned to the band labels shown to travellers.
export const DISTANCE_BAND_METERS: Record<string, number> = {
  near: 400,
  medium: 1200,
  far: 2500,
  unknown: Infinity,
};

export function toSearchDisplay(pkg: CataloguePackage): SearchPackageDisplay {
  const dist = (b: string) =>
    b === 'near' ? 'Near Haram' : b === 'far' ? 'Far' : b === 'medium' ? 'Medium' : '-';

  const departureRoute = pkg.departureAirport ? `${pkg.departureAirport} → JED/MED` : '-';

  return {
    id: pkg.id,
    slug: pkg.slug,
    departure: { date: pkg.dateWindow?.start ?? 'TBC', duration: '-', route: departureRoute },
    return: { date: pkg.dateWindow?.end ?? 'TBC', duration: '-', route: departureRoute },
    makkahHotel: {
      name: pkg.hotelMakkahName ?? pkg.title,
      location: 'Makkah',
      rating: pkg.hotelMakkahStars ?? 4,
      distance: dist(pkg.distanceBandMakkah),
      image: pkg.images?.[0] ?? PLACEHOLDER_IMAGE,
    },
    madinaHotel: {
      name: pkg.hotelMadinahName ?? pkg.title,
      location: 'Madinah',
      rating: pkg.hotelMadinahStars ?? 4,
      distance: dist(pkg.distanceBandMadinah),
      image: pkg.images?.[0] ?? PLACEHOLDER_IMAGE,
    },
    price: pkg.pricePerPerson,
    currency: pkg.currency,
    priceNote: 'per person',
  };
}
