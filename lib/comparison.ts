import { Offer, OperatorProfile, Package } from './types';
import { getRegionSettings } from './i18n/region';
import { formatDistance, formatPriceForRegion, parseDistanceKm } from './i18n/format';

export interface ComparisonRow {
  id: string;
  price: string;
  operatorName: string;
  totalNights: number;
  splitNights: string;
  hotelRating: string;
  distance: string;
  occupancy: string;
  inclusions: string;
  notes: string;
  // Sortable values so the comparison view can flag the factual "best" on each
  // dimension (cheapest / closest / best-rated / most-included). Null = unknown.
  priceValue: number | null;
  hotelStarsValue: number | null;
  distanceValue: number | null; // metres; lower = closer to the Haram
  inclusionsCount: number;
}

// Representative metres per distance band, so banded package data can be ranked
// against offers that store an actual distance. Kept local to avoid a
// lib → components import.
const BAND_METERS: Record<string, number> = { near: 400, medium: 1200, far: 2500 };

const avg = (nums: number[]): number | null =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;

export function mapOfferToComparison(offer: Offer, operator?: OperatorProfile): ComparisonRow {
  const settings = getRegionSettings();
  const supportedOccupancy = [];
  if (offer.roomOccupancy.single) supportedOccupancy.push('Single');
  if (offer.roomOccupancy.double) supportedOccupancy.push('Double');
  if (offer.roomOccupancy.triple) supportedOccupancy.push('Triple');
  if (offer.roomOccupancy.quad) supportedOccupancy.push('Quad');

  const inclusionsList = [];
  if (offer.inclusions.visa) inclusionsList.push('Visa');
  if (offer.inclusions.flights) inclusionsList.push('Flights');
  if (offer.inclusions.transfers) inclusionsList.push('Transfers');
  if (offer.inclusions.meals) inclusionsList.push('Meals');

  const priceInfo = formatPriceForRegion(offer.pricePerPerson, offer.currency, settings);
  const distanceKm = parseDistanceKm(offer.distanceToHaram);
  const distance = distanceKm
    ? formatDistance(distanceKm, settings.distanceUnit)
    : offer.distanceToHaram || 'Not provided';

  return {
    id: offer.id,
    price: offer.currency && Number.isFinite(offer.pricePerPerson) ? priceInfo.formatted : 'Not provided',
    operatorName: operator?.companyName || 'Not provided',
    totalNights: offer.totalNights,
    splitNights: `${offer.nightsMakkah} / ${offer.nightsMadinah}`,
    hotelRating: offer.hotelStars ? `${offer.hotelStars} Stars` : 'Not provided',
    distance,
    occupancy: supportedOccupancy.join(', ') || 'Not provided',
    inclusions: inclusionsList.length > 0 ? inclusionsList.join(', ') : 'Not provided',
    notes: offer.notes || 'Not provided',
    priceValue: offer.currency && Number.isFinite(offer.pricePerPerson) ? offer.pricePerPerson : null,
    hotelStarsValue: offer.hotelStars ?? null,
    distanceValue: distanceKm != null ? distanceKm * 1000 : null,
    inclusionsCount: inclusionsList.length,
  };
}

export function mapPackageToComparison(pkg: Package, operator?: OperatorProfile): ComparisonRow {
  const settings = getRegionSettings();
  const supportedOccupancy = [];
  if (pkg.roomOccupancyOptions.single) supportedOccupancy.push('Single');
  if (pkg.roomOccupancyOptions.double) supportedOccupancy.push('Double');
  if (pkg.roomOccupancyOptions.triple) supportedOccupancy.push('Triple');
  if (pkg.roomOccupancyOptions.quad) supportedOccupancy.push('Quad');

  const inclusionsList = [];
  if (pkg.inclusions.visa) inclusionsList.push('Visa');
  if (pkg.inclusions.flights) inclusionsList.push('Flights');
  if (pkg.inclusions.transfers) inclusionsList.push('Transfers');
  if (pkg.inclusions.meals) inclusionsList.push('Meals');

  const hotelRating = (() => {
    if (pkg.hotelMakkahStars && pkg.hotelMadinahStars) {
      return `Makkah ${pkg.hotelMakkahStars} / Madinah ${pkg.hotelMadinahStars}`;
    }
    if (pkg.hotelMakkahStars) return `Makkah ${pkg.hotelMakkahStars} Stars`;
    if (pkg.hotelMadinahStars) return `Madinah ${pkg.hotelMadinahStars} Stars`;
    return 'Not provided';
  })();

  const distance = (() => {
    const makkah = pkg.distanceBandMakkah !== 'unknown' ? pkg.distanceBandMakkah : 'Not provided';
    const madinah = pkg.distanceBandMadinah !== 'unknown' ? pkg.distanceBandMadinah : 'Not provided';
    if (makkah === 'Not provided' && madinah === 'Not provided') return 'Not provided';
    return `Makkah ${makkah} / Madinah ${madinah}`;
  })();

  const priceInfo = formatPriceForRegion(pkg.pricePerPerson, pkg.currency, settings);
  const price = pkg.priceType === 'from'
    ? `From ${priceInfo.formatted}`
    : priceInfo.formatted;

  const starValues = [pkg.hotelMakkahStars, pkg.hotelMadinahStars].filter(
    (s): s is 3 | 4 | 5 => typeof s === 'number'
  );
  const bandMeters = [pkg.distanceBandMakkah, pkg.distanceBandMadinah]
    .map((b) => BAND_METERS[b])
    .filter((m): m is number => typeof m === 'number');

  return {
    id: pkg.id,
    price: pkg.currency && Number.isFinite(pkg.pricePerPerson) ? price : 'Not provided',
    operatorName: operator?.companyName || 'Not provided',
    totalNights: pkg.totalNights,
    splitNights: `${pkg.nightsMakkah} / ${pkg.nightsMadinah}`,
    hotelRating,
    distance,
    occupancy: supportedOccupancy.join(', ') || 'Not provided',
    inclusions: inclusionsList.length > 0 ? inclusionsList.join(', ') : 'Not provided',
    notes: pkg.notes || 'Not provided',
    priceValue: pkg.currency && Number.isFinite(pkg.pricePerPerson) ? pkg.pricePerPerson : null,
    hotelStarsValue: avg(starValues),
    distanceValue: bandMeters.length ? Math.min(...bandMeters) : null,
    inclusionsCount: inclusionsList.length,
  };
}

export function handleOfferSelection(currentSelectedIds: string[], newId: string): string[] {
  if (currentSelectedIds.includes(newId)) {
    return currentSelectedIds.filter((id) => id !== newId);
  }
  if (currentSelectedIds.length >= 3) {
    throw new Error('You can compare up to 3 offers');
  }
  return [...currentSelectedIds, newId];
}

export function handleComparisonSelection(currentSelectedIds: string[], newId: string): string[] {
  if (currentSelectedIds.includes(newId)) {
    return currentSelectedIds.filter((id) => id !== newId);
  }
  if (currentSelectedIds.length >= 3) {
    throw new Error('You can compare up to 3 items');
  }
  return [...currentSelectedIds, newId];
}
