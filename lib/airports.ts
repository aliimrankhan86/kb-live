export const UK_DEPARTURE_AIRPORTS = [
  { code: 'LHR', city: 'London', name: 'London Heathrow', helper: 'West London' },
  { code: 'LGW', city: 'London', name: 'London Gatwick', helper: 'South London' },
  { code: 'BHX', city: 'Birmingham', name: 'Birmingham Airport', helper: 'West Midlands' },
  { code: 'MAN', city: 'Manchester', name: 'Manchester Airport', helper: 'North West' },
  { code: 'LTN', city: 'London', name: 'London Luton', helper: 'North London' },
  { code: 'STN', city: 'London', name: 'London Stansted', helper: 'East London' },
  { code: 'GLA', city: 'Glasgow', name: 'Glasgow Airport', helper: 'Scotland' },
  { code: 'EDI', city: 'Edinburgh', name: 'Edinburgh Airport', helper: 'Scotland' },
  { code: 'BRS', city: 'Bristol', name: 'Bristol Airport', helper: 'South West' },
] as const;

export type AirportCode = typeof UK_DEPARTURE_AIRPORTS[number]['code'];

export const UMRAH_SEARCH_AIRPORTS = UK_DEPARTURE_AIRPORTS.filter((airport) =>
  ['LHR', 'LGW', 'BHX', 'MAN'].includes(airport.code)
);

export const AIRPORT_CODES = UK_DEPARTURE_AIRPORTS.map((airport) => airport.code) as [AirportCode, ...AirportCode[]];

const AIRPORT_CODE_SET = new Set<string>(AIRPORT_CODES);

export function isAirportCode(value: string | null | undefined): value is AirportCode {
  return typeof value === 'string' && AIRPORT_CODE_SET.has(value);
}

export function parseAirportCode(value: string | null | undefined): AirportCode | undefined {
  return isAirportCode(value) ? value : undefined;
}

export function getAirportLabel(code: string | null | undefined): string | undefined {
  const airport = UK_DEPARTURE_AIRPORTS.find((candidate) => candidate.code === code);
  return airport ? `${airport.name} (${airport.code})` : undefined;
}

/**
 * Departure location matching: the ONE place that maps what a person (or an
 * operator's CSV) types to airport codes. Case-insensitive, ignores extra
 * spaces/punctuation and a trailing "airport"/"international".
 *
 *   "LHR" / "Heathrow" / "London Heathrow" / "Heathrow Airport" → LHR
 *   "BHX" / "Birmingham Airport"                               → BHX
 *   "Birmingham"                                               → BHX (city)
 *   "London"                                                   → LHR, LGW, LTN, STN (city)
 *
 * A specific airport (code or name) resolves to that airport only; a city
 * resolves to every airport serving it. Anything else resolves to null.
 */
export interface DepartureLocation {
  codes: AirportCode[];
  label: string;
  kind: 'airport' | 'city';
}

const normaliseLocation = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(airport|international|intl)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const AIRPORT_ALIASES = new Map<string, AirportCode>();
for (const airport of UK_DEPARTURE_AIRPORTS) {
  const name = normaliseLocation(airport.name);
  AIRPORT_ALIASES.set(airport.code.toLowerCase(), airport.code);
  AIRPORT_ALIASES.set(name, airport.code);
  // "London Heathrow" → also "heathrow"
  const city = airport.city.toLowerCase();
  if (name.startsWith(`${city} `)) AIRPORT_ALIASES.set(name.slice(city.length + 1), airport.code);
}

const CITY_AIRPORTS = new Map<string, AirportCode[]>();
for (const airport of UK_DEPARTURE_AIRPORTS) {
  const key = normaliseLocation(airport.city);
  CITY_AIRPORTS.set(key, [...(CITY_AIRPORTS.get(key) ?? []), airport.code]);
}

export function resolveDepartureLocation(value: string | null | undefined): DepartureLocation | null {
  if (typeof value !== 'string') return null;
  const key = normaliseLocation(value);
  if (!key) return null;

  // A city name that is also a single airport's name ("Birmingham Airport" →
  // "birmingham") resolves as the city, which for one-airport cities is the
  // same airport. Multi-airport cities (London) need a specific airport name.
  const cityCodes = CITY_AIRPORTS.get(key);
  if (cityCodes && cityCodes.length > 1) {
    const city = UK_DEPARTURE_AIRPORTS.find((a) => a.code === cityCodes[0])!.city;
    return { codes: cityCodes, label: `${city} (any airport)`, kind: 'city' };
  }

  const code = AIRPORT_ALIASES.get(key) ?? cityCodes?.[0];
  if (!code) return null;
  return { codes: [code], label: getAirportLabel(code)!, kind: 'airport' };
}

/** City for a stored departure value ("LHR", "Heathrow", "London" → "London"). */
export function departureCityOf(value: string | null | undefined): string | undefined {
  const location = resolveDepartureLocation(value);
  return location ? UK_DEPARTURE_AIRPORTS.find((a) => a.code === location.codes[0])?.city : undefined;
}

/** Cities that have their own corridor page under /umrah/{city}. */
const CORRIDOR_PAGE_CITIES = new Set(['london', 'birmingham', 'manchester']);

/**
 * Link for "Umrah from {city}": the corridor page when one exists, otherwise
 * the search results for that city (never a link to a page that 404s).
 */
export function departureCityHref(city: string): string {
  const key = city.trim().toLowerCase();
  return CORRIDOR_PAGE_CITIES.has(key)
    ? `/umrah/${key}`
    : `/search/packages?type=umrah&departureCity=${encodeURIComponent(city.trim())}`;
}
