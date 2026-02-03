import { Offer, OperatorProfile, Package } from './types';

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
}

export function mapOfferToComparison(offer: Offer, operator?: OperatorProfile): ComparisonRow {
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

  return {
    id: offer.id,
    price:
      offer.currency && Number.isFinite(offer.pricePerPerson)
        ? `${offer.currency} ${offer.pricePerPerson}`
        : 'Not provided',
    operatorName: operator?.companyName || 'Not provided',
    totalNights: offer.totalNights,
    splitNights: `${offer.nightsMakkah} / ${offer.nightsMadinah}`,
    hotelRating: offer.hotelStars ? `${offer.hotelStars} Stars` : 'Not provided',
    distance: offer.distanceToHaram || 'Not provided',
    occupancy: supportedOccupancy.join(', ') || 'Not provided',
    inclusions: inclusionsList.length > 0 ? inclusionsList.join(', ') : 'Not provided',
    notes: offer.notes || 'Not provided',
  };
}

export function mapPackageToComparison(pkg: Package, operator?: OperatorProfile): ComparisonRow {
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

  const price = pkg.priceType === 'from'
    ? `From ${pkg.currency} ${pkg.pricePerPerson}`
    : `${pkg.currency} ${pkg.pricePerPerson}`;

  return {
    id: pkg.id,
    price:
      pkg.currency && Number.isFinite(pkg.pricePerPerson)
        ? price
        : 'Not provided',
    operatorName: operator?.companyName || 'Not provided',
    totalNights: pkg.totalNights,
    splitNights: `${pkg.nightsMakkah} / ${pkg.nightsMadinah}`,
    hotelRating,
    distance,
    occupancy: supportedOccupancy.join(', ') || 'Not provided',
    inclusions: inclusionsList.length > 0 ? inclusionsList.join(', ') : 'Not provided',
    notes: pkg.notes || 'Not provided',
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
