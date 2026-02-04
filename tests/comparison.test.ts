import { describe, it, expect, beforeEach } from 'vitest';
import { mapOfferToComparison, handleOfferSelection } from '../lib/comparison';
import { Offer, OperatorProfile } from '../lib/types';

describe('Comparison Logic', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'en-GB',
      configurable: true,
    });
  });
  const mockOffer: Offer = {
    id: 'off1',
    requestId: 'req1',
    operatorId: 'op1',
    createdAt: '2023-01-01',
    pricePerPerson: 1000,
    currency: 'GBP',
    totalNights: 10,
    nightsMakkah: 5,
    nightsMadinah: 5,
    hotelStars: 5,
    distanceToHaram: '100m',
    roomOccupancy: { single: false, double: true, triple: false, quad: true },
    inclusions: { visa: true, flights: false, transfers: true, meals: false },
    notes: 'Test notes',
  };

  const mockOperator: OperatorProfile = {
    id: 'op1',
    companyName: 'Test Operator',
    verificationStatus: 'verified',
    contactEmail: 'test@example.com',
  };

  it('maps offer correctly with operator', () => {
    const result = mapOfferToComparison(mockOffer, mockOperator);
    expect(result.operatorName).toBe('Test Operator');
    expect(result.price).toBe('£1,000');
    expect(result.occupancy).toBe('Double, Quad');
    expect(result.inclusions).toBe('Visa, Transfers');
  });

  it('handles missing operator', () => {
    const result = mapOfferToComparison(mockOffer, undefined);
    expect(result.operatorName).toBe('Not provided');
  });

  it('handles missing values gracefully', () => {
    const sparseOffer: Offer = {
      ...mockOffer,
      distanceToHaram: '', // Empty string
      notes: undefined,
      inclusions: { visa: false, flights: false, transfers: false, meals: false },
    };
    const result = mapOfferToComparison(sparseOffer, mockOperator);
    expect(result.distance).toBe('Not provided');
    expect(result.notes).toBe('Not provided');
    expect(result.inclusions).toBe('Not provided');
  });

  it('handles offer selection logic', () => {
    // Select new
    expect(handleOfferSelection([], '1')).toEqual(['1']);
    expect(handleOfferSelection(['1'], '2')).toEqual(['1', '2']);
    
    // Deselect
    expect(handleOfferSelection(['1', '2'], '1')).toEqual(['2']);
    
    // Limit
    expect(() => handleOfferSelection(['1', '2', '3'], '4')).toThrow('You can compare up to 3 offers');
  });
});
