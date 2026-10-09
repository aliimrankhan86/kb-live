/**
 * Pure search utilities — NO 'use client' directive.
 * Safe to import from both Server Components and Client Components.
 */

import type { Package as CataloguePackage } from '@/lib/types';
import { UK_DEPARTURE_AIRPORTS, resolveDepartureLocation, type DepartureLocation } from '@/lib/airports';
import { formatDate, friendlyDistance } from '@/lib/packages/display';

export interface SearchFlightSegment {
  date: string;
  duration: string;
  route: string;
}

export interface SearchHotel {
  // null = the operator has not supplied this. The card shows "Not provided"
  // rather than inferring a name or a star rating.
  name: string | null;
  location: string;
  rating: number | null;
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
  isFeatured: boolean;
}

// ─── Shared search query layer ───────────────────────────────────────────────
// ONE place that decides which packages a search returns. Used by the search
// results page (server pre-render + client), the corridor CTAs and the browse
// page, so the same URL always yields the same packages everywhere.
//
// Must-have criteria (applied strictly, only when the user set them):
//   type, departure location, travel dates.
// Preferences (budget, hotel stars, season, distance, direct flights):
//   a package that misses one is not an exact match, but when exact matches are
//   few it is still shown as a "closest match" with the reasons it differs.
// A package is never excluded for a field the user did not filter on, and a
// missing field is reported as "Not provided", never guessed.

export type CriterionId = 'budget' | 'hotelStars' | 'season' | 'distance' | 'flightType' | 'nights';

export interface UnmetCriterion {
  id: CriterionId;
  reason: string;
}

export interface SearchCriteria {
  type?: 'umrah' | 'hajj';
  location?: DepartureLocation;
  /** The user typed/sent a location we could not recognise (not applied). */
  unrecognisedLocation?: string;
  dates?: { start: string; end: string };
  budgetMin?: number;
  budgetMax?: number;
  hotelStars?: number[];
  season?: string;
  maxDistance?: number;
  directOnly?: boolean;
  /** Trip length in total nights (UX-09). */
  nights?: { min?: number; max?: number };
}

export interface CloseMatch {
  pkg: CataloguePackage;
  unmet: UnmetCriterion[];
}

export interface SearchResult {
  criteria: SearchCriteria;
  matches: CataloguePackage[];
  closeMatches: CloseMatch[];
}

/** Below this many exact matches, closest matches are shown too. */
export const CLOSE_MATCH_THRESHOLD = 3;
/** ponytail: fixed cap keeps the page short; make it a page if lists grow. */
export const CLOSE_MATCH_LIMIT = 10;

/** Every URL key that narrows results (kept in sync with the chips + Clear all). */
export const FILTER_PARAM_KEYS = [
  'departureAirport',
  'departureCity',
  'departureDate',
  'returnDate',
  'budgetMin',
  'budgetMax',
  'hotelStars',
  'season',
  'maxDistance',
  'flightType',
  'minNights',
  'maxNights',
] as const;

/** Duration presets for the filter panel; written to the URL as minNights / maxNights. */
export const DURATION_OPTIONS = [
  { id: 'up-to-7', label: 'Up to 7 nights', max: 7 },
  { id: '8-10', label: '8 to 10 nights', min: 8, max: 10 },
  { id: '11-14', label: '11 to 14 nights', min: 11, max: 14 },
  { id: '15-plus', label: '15 nights or more', min: 15 },
] as const satisfies readonly { id: string; label: string; min?: number; max?: number }[];

/** Airports that live packages depart from (standards §8: never a fixed list). */
export function liveAirportOptions(packages: CataloguePackage[]): { code: string; label: string }[] {
  const codes = new Set(
    packages.flatMap((p) => {
      const loc = resolveDepartureLocation(p.departureAirport);
      return loc?.kind === 'airport' ? [loc.codes[0]] : [];
    })
  );
  return UK_DEPARTURE_AIRPORTS.filter((a) => codes.has(a.code)).map((a) => ({ code: a.code, label: `${a.name} (${a.code})` }));
}

type ParamReader = { get(key: string): string | null };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const toNumber = (v: string | null) => (v != null && v.trim() !== '' ? Number(v) : NaN);

export function parseSearchCriteria(params: ParamReader): SearchCriteria {
  const criteria: SearchCriteria = {};

  const type = params.get('type');
  if (type === 'umrah' || type === 'hajj') criteria.type = type;

  const locationInput = params.get('departureAirport') || params.get('departureCity');
  if (locationInput && locationInput.trim()) {
    const location = resolveDepartureLocation(locationInput);
    if (location) criteria.location = location;
    else criteria.unrecognisedLocation = locationInput.trim();
  }

  const start = params.get('departureDate');
  const end = params.get('returnDate');
  if (start && ISO_DATE.test(start)) {
    const safeEnd = end && ISO_DATE.test(end) && end >= start ? end : start;
    criteria.dates = { start, end: safeEnd };
  }

  const min = toNumber(params.get('budgetMin'));
  const max = toNumber(params.get('budgetMax'));
  if (Number.isFinite(min) && min > 0) criteria.budgetMin = min;
  if (Number.isFinite(max) && max > 0) criteria.budgetMax = max;

  const stars = (params.get('hotelStars') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => [3, 4, 5].includes(n));
  if (stars.length > 0) criteria.hotelStars = stars;

  const season = params.get('season')?.trim().toLowerCase();
  if (season && season !== 'flexible') criteria.season = season;

  const maxDistance = toNumber(params.get('maxDistance'));
  if (Number.isFinite(maxDistance) && maxDistance > 0) criteria.maxDistance = maxDistance;

  if (params.get('flightType') === 'direct') criteria.directOnly = true;

  const minNights = toNumber(params.get('minNights'));
  const maxNights = toNumber(params.get('maxNights'));
  const nights = {
    ...(Number.isInteger(minNights) && minNights > 0 ? { min: minNights } : {}),
    ...(Number.isInteger(maxNights) && maxNights > 0 ? { max: maxNights } : {}),
  };
  if (nights.min !== undefined || nights.max !== undefined) criteria.nights = nights;

  return criteria;
}

// Season keywords matched against the operator's free-text season label.
const SEASON_PATTERNS: Record<string, RegExp> = {
  ramadan: /ramadan/i,
  'school-holidays': /school|christmas|easter|half[\s-]?term|summer/i,
  summer: /summer/i,
};

const gbp = (n: number) => `£${n.toLocaleString('en-GB')}`;
const metres = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);

/** Representative metres for a band, used only when exact metres are not stated. */
export const DISTANCE_BAND_METERS: Record<string, number> = {
  near: 400,
  medium: 1200,
  far: 2500,
  unknown: Infinity,
};

/** Makkah hotel distance to the Haram: stated metres first, else the band. */
export const makkahDistance = (p: CataloguePackage): number =>
  typeof p.distanceToHaramMakkahMetres === 'number' && p.distanceToHaramMakkahMetres > 0
    ? p.distanceToHaramMakkahMetres
    : DISTANCE_BAND_METERS[p.distanceBandMakkah] ?? Infinity;

function passesMustHaves(p: CataloguePackage, c: SearchCriteria): boolean {
  if (c.type && p.pilgrimageType !== c.type) return false;
  if (c.location) {
    const pkgLocation = resolveDepartureLocation(p.departureAirport);
    if (!pkgLocation || !pkgLocation.codes.some((code) => c.location!.codes.includes(code))) return false;
  }
  if (c.dates) {
    // Overlap: the package's dates touch the traveller's window.
    const w = p.dateWindow;
    if (!w?.start) return false;
    const pkgEnd = w.end && w.end >= w.start ? w.end : w.start;
    if (w.start > c.dates.end || pkgEnd < c.dates.start) return false;
  }
  return true;
}

function unmetPreferences(p: CataloguePackage, c: SearchCriteria): UnmetCriterion[] {
  const unmet: UnmetCriterion[] = [];

  if (c.budgetMax !== undefined && p.pricePerPerson > c.budgetMax) {
    unmet.push({ id: 'budget', reason: `Price ${gbp(p.pricePerPerson)} per person is above your ${gbp(c.budgetMax)} budget` });
  } else if (c.budgetMin !== undefined && p.pricePerPerson < c.budgetMin) {
    unmet.push({ id: 'budget', reason: `Price ${gbp(p.pricePerPerson)} per person is below your ${gbp(c.budgetMin)} minimum` });
  }

  if (c.hotelStars) {
    const stars = [p.hotelMakkahStars, p.hotelMadinahStars];
    if (!stars.some((s) => typeof s === 'number' && c.hotelStars!.includes(s))) {
      const fmt = (s?: number) => (typeof s === 'number' ? `${s} star` : 'Not provided');
      unmet.push({
        id: 'hotelStars',
        reason: `Hotel rating: Makkah ${fmt(p.hotelMakkahStars)}, Madinah ${fmt(p.hotelMadinahStars)}`,
      });
    }
  }

  if (c.season) {
    const pattern = SEASON_PATTERNS[c.season];
    const label = p.seasonLabel?.trim();
    const ok = label ? (pattern ? pattern.test(label) : label.toLowerCase().includes(c.season)) : false;
    if (!ok) unmet.push({ id: 'season', reason: `Season: ${label || 'Not provided'}` });
  }

  if (c.maxDistance !== undefined) {
    const d = makkahDistance(p);
    if (!(d <= c.maxDistance)) {
      unmet.push({
        id: 'distance',
        reason: Number.isFinite(d)
          ? `Makkah hotel is further than ${metres(c.maxDistance)} from the Haram`
          : 'Distance to the Haram: Not provided',
      });
    }
  }

  if (c.nights && ((c.nights.min !== undefined && p.totalNights < c.nights.min) || (c.nights.max !== undefined && p.totalNights > c.nights.max))) {
    unmet.push({ id: 'nights', reason: `Trip length: ${p.totalNights} nights` });
  }

  if (c.directOnly && p.flightType !== 'direct') {
    unmet.push({
      id: 'flightType',
      reason: `Flight: ${p.flightType === 'one-stop' ? '1 stop' : p.flightType === 'multi-stop' ? '2+ stops' : 'Not provided'}`,
    });
  }

  return unmet;
}

export function searchPackages(packages: CataloguePackage[], params: ParamReader): SearchResult {
  const criteria = parseSearchCriteria(params);
  const matches: CataloguePackage[] = [];
  const near: CloseMatch[] = [];

  for (const pkg of packages) {
    if (!passesMustHaves(pkg, criteria)) continue;
    const unmet = unmetPreferences(pkg, criteria);
    if (unmet.length === 0) matches.push(pkg);
    else near.push({ pkg, unmet });
  }

  // Stable sort keeps the neutral input order within the same number of misses.
  const closeMatches =
    matches.length < CLOSE_MATCH_THRESHOLD
      ? near.sort((a, b) => a.unmet.length - b.unmet.length).slice(0, CLOSE_MATCH_LIMIT)
      : [];

  return { criteria, matches, closeMatches };
}

/** Exact matches only (SEO counts, JSON-LD). */
export function filterByParams(packages: CataloguePackage[], params: ParamReader): CataloguePackage[] {
  return searchPackages(packages, params).matches;
}


export function toSearchDisplay(pkg: CataloguePackage): SearchPackageDisplay {
  // Same wording as the package page: stated metres first, else the band.
  const dist = (city: 'Makkah' | 'Madinah', m?: number, band?: CataloguePackage['distanceBandMakkah']) =>
    friendlyDistance(city, m, band)?.primary ?? 'Distance not provided';

  const departureRoute = pkg.departureAirport ? `${pkg.departureAirport} → JED/MED` : '-';

  return {
    id: pkg.id,
    slug: pkg.slug,
    departure: { date: pkg.dateWindow?.start ? formatDate(pkg.dateWindow.start) : 'TBC', duration: '-', route: departureRoute },
    return: { date: pkg.dateWindow?.end ? formatDate(pkg.dateWindow.end) : 'TBC', duration: '-', route: departureRoute },
    makkahHotel: {
      // Operator-supplied facts only — missing name/stars stay null (shown as
      // "Not provided"), never inferred from the package title or a default.
      name: pkg.hotelMakkahName ?? null,
      location: 'Makkah',
      rating: pkg.hotelMakkahStars ?? null,
      distance: dist('Makkah', pkg.distanceToHaramMakkahMetres, pkg.distanceBandMakkah),
      image: pkg.images?.[0] ?? '',
    },
    madinaHotel: {
      name: pkg.hotelMadinahName ?? null,
      location: 'Madinah',
      rating: pkg.hotelMadinahStars ?? null,
      distance: dist('Madinah', pkg.distanceToHaramMadinahMetres, pkg.distanceBandMadinah),
      image: pkg.images?.[0] ?? '',
    },
    price: pkg.pricePerPerson,
    currency: pkg.currency,
    priceNote: 'per person',
    isFeatured: pkg.isFeatured ?? false,
  };
}

/** Inclusion chips for a card: only what the operator marked as included. */
export function buildInclusionChips(pkg: CataloguePackage): { label: string; included: boolean }[] {
  return [
    { label: 'Visa', included: pkg.inclusions?.visa ?? false },
    { label: 'Flights', included: pkg.inclusions?.flights ?? false },
    { label: 'Transfers', included: pkg.inclusions?.transfers ?? false },
    { label: 'Meals', included: pkg.inclusions?.meals ?? false },
  ].filter((chip) => chip.included);
}

/**
 * The ONE mapping from a stored package to PackageCard props, shared by search
 * results, featured slots and the browse page so a package reads identically.
 */
export function toPackageCardProps(pkg: CataloguePackage) {
  return {
    package: toSearchDisplay(pkg),
    inclusions: buildInclusionChips(pkg),
    totalNights: pkg.totalNights,
    priceUpdatedAt: pkg.updatedAt,
    nightsMakkah: pkg.nightsMakkah,
    nightsMadinah: pkg.nightsMadinah,
    priceType: (pkg.priceType === 'from' ? 'from' : 'exact') as 'from' | 'exact',
  };
}
