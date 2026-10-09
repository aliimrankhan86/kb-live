/**
 * Presentation helpers for package data — turns stored fields into plain English
 * a layman can act on, and writes neutral "what this means" copy. Nothing here
 * invents operator data; it only formats / explains values that exist.
 */
import type { Package } from '@/lib/types';

export interface InclusionInfo {
  key: keyof Package['inclusions'];
  label: string;
  /** Neutral, generic explanation of what this inclusion typically covers. */
  help: string;
}

export const INCLUSIONS: InclusionInfo[] = [
  { key: 'visa', label: 'Visa', help: 'Your Saudi entry visa for the trip.' },
  { key: 'flights', label: 'Flights', help: 'Return flights between the UK and Saudi Arabia.' },
  { key: 'transfers', label: 'Transfers', help: 'Airport pick-up/drop-off and travel between Makkah and Madinah.' },
  { key: 'meals', label: 'Meals', help: 'Meals provided at the hotel. Ask the operator which ones.' },
];

const walkMinutes = (metres: number) => Math.max(1, Math.round(metres / 80));
/** "an 8-minute", "an 11-minute", "an 18-minute", else "a ...". */
const aOrAn = (n: number) => (/^(8|11|18|8\d)$/.test(String(n)) ? 'an' : 'a');

/** City-aware label for the holy site a hotel sits near. */
export const haramLabel = (city: 'Makkah' | 'Madinah') =>
  city === 'Makkah' ? 'the Haram (Grand Mosque)' : "the Prophet's Mosque";

/**
 * Friendly distance for a hotel. Prefers exact metres (with a walking estimate);
 * falls back to the band; returns null when nothing is known so the caller can
 * omit the line entirely.
 */
export function friendlyDistance(
  city: 'Makkah' | 'Madinah',
  metres?: number,
  band?: 'near' | 'medium' | 'far' | 'unknown'
): { primary: string; note?: string } | null {
  if (typeof metres === 'number' && metres > 0) {
    const dist = metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${metres} m`;
    return { primary: `${dist} from ${haramLabel(city)}`, note: `about ${aOrAn(walkMinutes(metres))} ${walkMinutes(metres)}-minute walk` };
  }
  switch (band) {
    case 'near':
      return { primary: `Near ${haramLabel(city)}`, note: 'a short walk' };
    case 'medium':
      return { primary: `A short distance from ${haramLabel(city)}`, note: 'roughly a 10 to 20 minute walk' };
    case 'far':
      return { primary: `Further from ${haramLabel(city)}`, note: 'likely a shuttle or taxi' };
    default:
      return null;
  }
}

export const flightTypeLabel = (t?: Package['flightType']): string | null => {
  switch (t) {
    case 'direct':
      return 'Direct flight';
    case 'one-stop':
      return '1 stop';
    case 'multi-stop':
      return '2+ stops';
    default:
      return null;
  }
};

export const groupTypeLabel = (g?: Package['groupType']): string | null => {
  switch (g) {
    case 'private':
      return 'Private (your group only)';
    case 'small-group':
      return 'Small group';
    case 'large-group':
      return 'Large group';
    default:
      return null;
  }
};

/** Short label for the same value, for the dense comparison view. */
export const groupTypeShort = (g?: Package['groupType']): string | null => {
  switch (g) {
    case 'private':
      return 'Private';
    case 'small-group':
      return 'Small group';
    case 'large-group':
      return 'Large group';
    default:
      return null;
  }
};

/**
 * Comparison-grid label for the operator-stated ziyarat field: Yes / No /
 * Not provided. `undefined`/`null` (not stated) → "Not provided", never inferred.
 */
export const ziyaratShort = (included?: boolean | null): string =>
  included == null ? 'Not provided' : included ? 'Yes' : 'No';

export const roomOptionsLabel = (o: Package['roomOccupancyOptions']): string => {
  const parts = [
    o.single && 'Single',
    o.double && 'Double',
    o.triple && 'Triple',
    o.quad && 'Quad (4 sharing)',
  ].filter(Boolean);
  return parts.length ? (parts as string[]).join(', ') : 'Not provided';
};

/**
 * One date format for every surface (cards, package page, compare, chips):
 * "18 Dec 2026". Parses the ISO date parts directly so the day never shifts
 * with the server or browser time zone. Unparseable input is returned as-is.
 */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function formatDateRange(start: string, end?: string): string {
  return end && end !== start ? `${formatDate(start)} to ${formatDate(end)}` : formatDate(start);
}

/**
 * One nights format for every surface: "10 nights · 5 Makkah · 5 Madinah".
 * The split is only shown when the operator stated both cities; it is never
 * derived from the total.
 */
export function nightsText(p: { totalNights: number; nightsMakkah?: number; nightsMadinah?: number }): string {
  const total = `${p.totalNights} night${p.totalNights === 1 ? '' : 's'}`;
  const split =
    p.nightsMakkah && p.nightsMadinah
      ? `${p.nightsMakkah} Makkah · ${p.nightsMadinah} Madinah`
      : 'Makkah and Madinah split not provided';
  return `${total} · ${split}`;
}

/**
 * Standards §6: show the price exactly as the operator gave it. Never converts
 * currency, rounds or recomputes. "£1,495" / "£1,495.50" / "US$1,200".
 */
export function formatStatedPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Item 9: optional operator-stated price per person by room type, in display order. */
export const ROOM_PRICES = [
  { key: 'priceQuadPerPerson', id: 'quad', label: 'Quad room (4 sharing)' },
  { key: 'priceTriplePerPerson', id: 'triple', label: 'Triple room (3 sharing)' },
  { key: 'priceDoublePerPerson', id: 'double', label: 'Double room (2 sharing)' },
] as const;

type RoomPriceFields = Pick<Package, (typeof ROOM_PRICES)[number]['key']>;

/** A room price counts only when stated and above 0; blank, null and 0 are "Not provided". */
export const isStatedRoomPrice = (amount: number | null | undefined): amount is number =>
  typeof amount === 'number' && Number.isFinite(amount) && amount > 0;

/** True when the operator stated at least one room price. */
export const hasRoomPrices = (p: RoomPriceFields): boolean =>
  ROOM_PRICES.some(({ key }) => isStatedRoomPrice(p[key]));

/** "£1,095 per person" exactly as stated, or "Not provided". Never converted. */
export const roomPriceText = (amount: number | null | undefined, currency: string): string =>
  isStatedRoomPrice(amount) ? `${formatStatedPrice(amount, currency)} per person` : 'Not provided';

/** "From £1,495" or "£1,495": one price label for every surface. */
export function priceText(p: { pricePerPerson: number; currency: string; priceType: string }): string {
  const amount = formatStatedPrice(p.pricePerPerson, p.currency);
  return p.priceType === 'from' ? `From ${amount}` : amount;
}

/** Short §6 attribution for cards: "As stated by Example Ltd, updated 6 Oct 2026". */
export function priceAttributionShort(operatorName?: string, updatedAt?: string): string {
  return `As stated by ${operatorName ?? 'the operator'}${updatedAt ? `, updated ${formatDate(updatedAt)}` : ''}`;
}

/** Full §6 attribution for the package page and enquiry. */
export function priceAttribution(operatorName?: string, updatedAt?: string): string {
  return `Price per person as stated by ${operatorName ?? 'the operator'}${
    updatedAt ? `, last updated ${formatDate(updatedAt)}` : ''
  }. Confirm the final price with the operator before paying.`;
}

/** Three-state inclusion label: true / false / not stated (founder decision 2026-10-06). */
export const inclusionLabel = (value: boolean | null | undefined): 'Included' | 'Not included' | 'Not provided' =>
  value === true ? 'Included' : value === false ? 'Not included' : 'Not provided';
