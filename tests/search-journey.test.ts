/**
 * Reported problem: the browse tab shows one set of packages, but after a
 * traveller enters location and other details the results page shows a
 * different set and packages go missing. These tests pin the shared query
 * layer that both surfaces now use.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  CLOSE_MATCH_THRESHOLD,
  FILTER_PARAM_KEYS,
  filterByParams,
  parseSearchCriteria,
  searchPackages,
  toPackageCardProps,
} from '@/components/search/search-utils';
import { resolveDepartureLocation, departureCityOf } from '@/lib/airports';
import { formatDate, formatDateRange } from '@/lib/packages/display';
import type { Package } from '@/lib/types';

const base: Package = {
  id: 'base',
  operatorId: 'op1',
  title: 'Umrah package',
  slug: 'umrah-package',
  status: 'published',
  pilgrimageType: 'umrah',
  priceType: 'from',
  pricePerPerson: 1200,
  currency: 'GBP',
  totalNights: 10,
  nightsMakkah: 5,
  nightsMadinah: 5,
  distanceBandMakkah: 'unknown',
  distanceBandMadinah: 'unknown',
  roomOccupancyOptions: { single: false, double: true, triple: true, quad: true },
  inclusions: { visa: true, flights: true, transfers: true, meals: false },
};

const pkg = (id: string, over: Partial<Package> = {}): Package => ({ ...base, id, slug: id, ...over });

const catalogue: Package[] = [
  pkg('lhr-dec', { departureAirport: 'LHR', pricePerPerson: 1495, dateWindow: { start: '2026-12-18', end: '2026-12-28' }, seasonLabel: 'Christmas holidays', hotelMakkahStars: 4, hotelMadinahStars: 4, distanceToHaramMakkahMetres: 350, distanceBandMakkah: 'near', flightType: 'direct' }),
  pkg('bhx-dec', { departureAirport: 'BHX', pricePerPerson: 1550, dateWindow: { start: '2026-12-20', end: '2027-01-03' }, seasonLabel: 'School Holidays', hotelMakkahStars: 4, distanceBandMakkah: 'medium', flightType: 'one-stop' }),
  pkg('man-jan', { departureAirport: 'MAN', pricePerPerson: 899, dateWindow: { start: '2027-01-15', end: '2027-01-22' }, hotelMakkahStars: 3, distanceBandMakkah: 'far' }),
  // Deliberately incomplete: no stars, no distance, no season, no flight type.
  pkg('bhx-incomplete', { departureAirport: 'BHX', pricePerPerson: 1200, dateWindow: { start: '2026-12-10', end: '2026-12-20' } }),
  // Free text as an operator might type it into a CSV.
  pkg('stn-text', { departureAirport: 'London Stansted', pricePerPerson: 1340, dateWindow: { start: '2027-02-01', end: '2027-02-13' } }),
  pkg('lgw-nov', { departureAirport: 'LGW', pricePerPerson: 1099, dateWindow: { start: '2026-11-05', end: '2026-11-11' } }),
  // No departure airport and no dates stated.
  pkg('no-airport', { pricePerPerson: 980, seasonLabel: 'Hajj' }),
  pkg('hajj', { pilgrimageType: 'hajj', departureAirport: 'LHR', pricePerPerson: 7950 }),
];

const ids = (packages: Package[]) => packages.map((p) => p.id);
const q = (s: string) => new URLSearchParams(s);

describe('departure location matching (one mapping, in lib/airports.ts)', () => {
  it.each([
    ['LHR', ['LHR']],
    ['lhr', ['LHR']],
    ['Heathrow', ['LHR']],
    ['  London   Heathrow ', ['LHR']],
    ['Heathrow Airport', ['LHR']],
    ['BHX', ['BHX']],
    ['Birmingham', ['BHX']],
    ['Birmingham Airport', ['BHX']],
    ['birmingham airport', ['BHX']],
    ['Manchester', ['MAN']],
    ['London', ['LHR', 'LGW', 'LTN', 'STN']],
    ['london', ['LHR', 'LGW', 'LTN', 'STN']],
    ['Stansted', ['STN']],
  ])('resolves %j', (input, codes) => {
    expect(resolveDepartureLocation(input)?.codes).toEqual(codes);
  });

  it('returns null for unknown or empty input', () => {
    expect(resolveDepartureLocation('Paris')).toBeNull();
    expect(resolveDepartureLocation('LON')).toBeNull();
    expect(resolveDepartureLocation('   ')).toBeNull();
    expect(resolveDepartureLocation(undefined)).toBeNull();
  });

  it('derives the city of free-text stored airports', () => {
    expect(departureCityOf('London Stansted')).toBe('London');
    expect(departureCityOf('BHX')).toBe('Birmingham');
    expect(departureCityOf('nowhere')).toBeUndefined();
  });
});

describe('search results: location is a strict must-have', () => {
  it('London (city) includes every London airport, free text included', () => {
    expect(ids(filterByParams(catalogue, q('type=umrah&departureAirport=London')))).toEqual(['lhr-dec', 'stn-text', 'lgw-nov']);
  });

  it('corridor links (departureCity=Birmingham) filter instead of being ignored', () => {
    expect(ids(filterByParams(catalogue, q('type=umrah&departureCity=Birmingham')))).toEqual(['bhx-dec', 'bhx-incomplete']);
  });

  it('a specific airport keeps only that airport', () => {
    expect(ids(filterByParams(catalogue, q('departureAirport=Heathrow')))).toEqual(['lhr-dec', 'hajj']);
  });

  it('an unrecognised location is not applied and is reported, never silently', () => {
    const { criteria, matches } = searchPackages(catalogue, q('departureAirport=Paris'));
    expect(criteria.unrecognisedLocation).toBe('Paris');
    expect(matches).toHaveLength(catalogue.length);
  });
});

describe('search results: travel dates are a strict must-have, only when set', () => {
  it('keeps packages whose dates overlap the window', () => {
    expect(ids(filterByParams(catalogue, q('departureDate=2026-12-15&returnDate=2026-12-31')))).toEqual([
      'lhr-dec',
      'bhx-dec',
      'bhx-incomplete',
    ]);
  });

  it('does not filter on dates when none were sent', () => {
    expect(filterByParams(catalogue, q('type=umrah'))).toHaveLength(catalogue.length - 1);
  });

  it('ignores malformed dates rather than emptying the page', () => {
    expect(parseSearchCriteria(q('departureDate=tomorrow')).dates).toBeUndefined();
  });
});

describe('preferences never silently drop or silently ignore', () => {
  it('a package missing a field is kept when the user did not filter on it', () => {
    expect(ids(filterByParams(catalogue, q('departureCity=Birmingham')))).toContain('bhx-incomplete');
  });

  it('budget max is applied, not quietly dropped when nothing fits', () => {
    const { matches, closeMatches } = searchPackages(catalogue, q('departureCity=Birmingham&budgetMax=1000'));
    expect(matches).toEqual([]);
    expect(closeMatches.map((m) => m.pkg.id)).toEqual(['bhx-dec', 'bhx-incomplete']);
    expect(closeMatches[0].unmet[0].reason).toBe('Price £1,550 per person is above your £1,000 budget');
  });

  it('closest matches explain missing data as "Not provided"', () => {
    const { closeMatches } = searchPackages(catalogue, q('departureCity=Birmingham&hotelStars=5&maxDistance=500&flightType=direct'));
    const incomplete = closeMatches.find((m) => m.pkg.id === 'bhx-incomplete')!;
    expect(incomplete.unmet.map((u) => u.reason)).toEqual([
      'Hotel rating: Makkah Not provided, Madinah Not provided',
      'Distance to the Haram: Not provided',
      'Flight: Not provided',
    ]);
  });

  it('closest matches only appear when exact matches are few', () => {
    const { matches, closeMatches } = searchPackages(catalogue, q('type=umrah&budgetMax=1600'));
    expect(matches.length).toBeGreaterThanOrEqual(CLOSE_MATCH_THRESHOLD);
    expect(closeMatches).toEqual([]);
  });

  it('closest matches never include packages that fail a must-have', () => {
    const { closeMatches } = searchPackages(catalogue, q('departureAirport=MAN&budgetMax=500'));
    expect(closeMatches.map((m) => m.pkg.id)).toEqual(['man-jan']);
  });

  it('school holidays does not treat Hajj as a school holiday', () => {
    expect(ids(filterByParams(catalogue, q('season=school-holidays')))).toEqual(['lhr-dec', 'bhx-dec']);
  });

  it('distance uses the stated Makkah metres, not the Madinah hotel', () => {
    expect(ids(filterByParams(catalogue, q('maxDistance=400')))).toEqual(['lhr-dec']);
  });
});

describe('URL state reproduces results', () => {
  it('the same URL always yields the same results, regardless of param order', () => {
    const a = searchPackages(catalogue, q('departureCity=London&budgetMax=1400&sort=price-asc'));
    const b = searchPackages(catalogue, q('sort=price-asc&budgetMax=1400&departureCity=London'));
    expect(ids(a.matches)).toEqual(ids(b.matches));
    expect(a.closeMatches.map((m) => m.pkg.id)).toEqual(b.closeMatches.map((m) => m.pkg.id));
  });

  it('every narrowing key the parser reads is cleared by "Clear all"', () => {
    const src = readFileSync(join(process.cwd(), 'components/search/search-utils.ts'), 'utf8');
    const parser = src.slice(src.indexOf('export function parseSearchCriteria'), src.indexOf('// Season keywords'));
    const read = [...parser.matchAll(/params\.get\('([a-zA-Z]+)'\)/g)].map((m) => m[1]).filter((k) => k !== 'type');
    for (const key of read) expect(FILTER_PARAM_KEYS).toContain(key);
  });
});

describe('one card mapping, one date format', () => {
  it('maps every card field from stored data, with Not provided for gaps', () => {
    const card = toPackageCardProps(catalogue.find((p) => p.id === 'bhx-incomplete')!);
    expect(card.package.makkahHotel.name).toBeNull();
    expect(card.package.makkahHotel.rating).toBeNull();
    expect(card.package.makkahHotel.distance).toBe('Distance not provided');
    expect(card.package.departure.date).toBe('10 Dec 2026');
    expect(card.priceType).toBe('from');
    expect(JSON.stringify(card)).not.toMatch(/undefined|null"|NaN/);
  });

  it('formats ISO dates without time-zone drift', () => {
    expect(formatDate('2026-12-01')).toBe('1 Dec 2026');
    expect(formatDateRange('2026-12-18', '2026-12-28')).toBe('18 Dec 2026 to 28 Dec 2026');
    expect(formatDateRange('2026-12-18', '2026-12-18')).toBe('18 Dec 2026');
  });
});

describe('guard: no fixture or demo data in production code paths', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      return statSync(full).isDirectory() ? walk(full) : /\.(ts|tsx)$/.test(name) ? [full] : [];
    });

  it('app/ and components/ never import mock packages or the MockDB seed', () => {
    // ponytail: e2e reset route is gated by E2E_TESTING and only resets MockDB.
    const allowed = new Set(['app/api/e2e/reset/route.ts', 'components/operator/AnalyticsSeedButton.tsx']);
    const offenders = [...walk('app'), ...walk('components')].filter((file) => {
      if (allowed.has(file)) return false;
      return /from ['"]@\/lib\/(mock-packages|api\/mock-db)['"]/.test(readFileSync(file, 'utf8'));
    });
    expect(offenders).toEqual([]);
  });
});

describe('one nights format', () => {
  it('uses the stored total and never derives a split', async () => {
    const { nightsText } = await import('@/lib/packages/display');
    expect(nightsText({ totalNights: 10, nightsMakkah: 5, nightsMadinah: 5 })).toBe('10 nights · 5 Makkah · 5 Madinah');
    expect(nightsText({ totalNights: 10, nightsMakkah: 0, nightsMadinah: 0 })).toBe('10 nights · Makkah and Madinah split not provided');
    expect(toPackageCardProps({ ...base, totalNights: 12, nightsMakkah: 0, nightsMadinah: 0 }).totalNights).toBe(12);
  });
});
