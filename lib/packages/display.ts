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
  { key: 'meals', label: 'Meals', help: 'Meals provided at the hotel — ask the operator which ones.' },
];

const walkMinutes = (metres: number) => Math.max(1, Math.round(metres / 80));

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
    return { primary: `${dist} from ${haramLabel(city)}`, note: `about a ${walkMinutes(metres)}-minute walk` };
  }
  switch (band) {
    case 'near':
      return { primary: `Near ${haramLabel(city)}`, note: 'a short walk' };
    case 'medium':
      return { primary: `A short distance from ${haramLabel(city)}`, note: 'roughly a 10–20 minute walk' };
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
      return 'Private — your group only';
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

export const roomOptionsLabel = (o: Package['roomOccupancyOptions']): string => {
  const parts = [
    o.single && 'Single',
    o.double && 'Double',
    o.triple && 'Triple',
    o.quad && 'Quad (4 sharing)',
  ].filter(Boolean);
  return parts.length ? (parts as string[]).join(', ') : 'Not provided';
};
