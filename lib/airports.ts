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
