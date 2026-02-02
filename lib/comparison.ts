import { Offer, OperatorProfile } from './types';

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
    price: `${offer.currency} ${offer.pricePerPerson}`,
    operatorName: operator?.companyName || 'Unknown',
    totalNights: offer.totalNights,
    splitNights: `${offer.nightsMakkah} / ${offer.nightsMadinah}`,
    hotelRating: `${offer.hotelStars} Stars`,
    distance: offer.distanceToHaram || 'Not provided',
    occupancy: supportedOccupancy.join(', ') || 'None specified',
    inclusions: inclusionsList.length > 0 ? inclusionsList.join(', ') : 'None',
    notes: offer.notes || '-',
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
