import { beforeEach, describe, expect, it } from 'vitest';
import { MockDB } from '../lib/api/mock-db';
import { Repository, RequestContext } from '../lib/api/repository';
import { Offer, OperatorProfile, QuoteRequest } from '../lib/types';

const customerCtx: RequestContext = { userId: 'cust1', role: 'customer' };

const verifiedOperator = (id: string, overrides: Partial<OperatorProfile> = {}): OperatorProfile => ({
  id,
  companyName: `Operator ${id}`,
  companyRegistrationNumber: '99998888',
  verificationStatus: 'verified',
  verifiedAt: '2026-06-01T09:00:00.000Z',
  tier: 'verified',
  contactEmail: `${id}@example.com`,
  contactPhone: '+44 20 7000 0000',
  eligibilityFlags: {
    canReceiveBookings: false,
    bankDetailsActive: false,
    onboardingComplete: false,
  },
  ...overrides,
});

const saveRequestAndOffer = (operatorId: string) => {
  const request: QuoteRequest = {
    id: `req-${operatorId}`,
    customerId: 'cust1',
    status: 'open',
    createdAt: new Date().toISOString(),
    type: 'umrah',
    season: 'flexible',
    totalNights: 7,
    nightsMakkah: 4,
    nightsMadinah: 3,
    hotelStars: 4,
    distancePreference: 'near',
    occupancy: { single: 0, double: 1, triple: 0, quad: 0 },
    inclusions: { visa: true, flights: true, transfers: true, meals: false },
  };
  MockDB.saveRequest(request);

  const offer: Offer = {
    id: `offer-${operatorId}`,
    requestId: request.id,
    operatorId,
    createdAt: new Date().toISOString(),
    pricePerPerson: 1200,
    currency: 'GBP',
    totalNights: 7,
    nightsMakkah: 4,
    nightsMadinah: 3,
    hotelStars: 4,
    distanceToHaram: '300m',
    roomOccupancy: { double: true },
    inclusions: { visa: true, flights: true, transfers: true, meals: false },
  };

  Repository.createOffer({ userId: operatorId, role: 'operator' }, offer);
  return offer;
};

describe('operator eligibility gating', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('treats the seeded verified operator with active payment details as bookable', async () => {
    expect(await Repository.isOperatorBookable('op1')).toBe(true);
  });

  it('defaults listed operators to not bookable even after bank details capture', async () => {
    expect(await Repository.isOperatorBookable('op2')).toBe(false);

    Repository.createPaymentDetails(
      { userId: 'op2', role: 'operator' },
      {
        operatorId: 'op2',
        details: {
          accountHolderName: 'Makkah Tours UK',
          bankName: 'Example Business Bank',
          sortCode: '40-00-00',
          accountNumber: '87654321',
          currency: 'GBP',
          country: 'GB',
        },
        phoneConfirmation: { confirmed: true, phoneLastFour: '7821' },
      }
    );

    expect(await Repository.isOperatorBookable('op2')).toBe(false);
    expect(MockDB.getOperatorById('op2')?.tier).toBe('listed');
    expect(MockDB.getOperatorById('op2')?.eligibilityFlags?.canReceiveBookings).toBe(false);
  });

  it('requires verified tier and active payment details', async () => {
    MockDB.saveOperator(verifiedOperator('op3'));
    expect(await Repository.isOperatorBookable('op3')).toBe(false);

    await Repository.createPaymentDetails(
      { userId: 'op3', role: 'operator' },
      {
        operatorId: 'op3',
        details: {
          accountHolderName: 'Operator Three Ltd',
          bankName: 'Example Business Bank',
          sortCode: '50-00-00',
          accountNumber: '55556666',
          currency: 'GBP',
          country: 'GB',
        },
        phoneConfirmation: { confirmed: true, phoneLastFour: '0000' },
      }
    );

    expect(await Repository.isOperatorBookable('op3')).toBe(true);
  });

  it('blocks operators with payment SLA flags', async () => {
    MockDB.saveOperator(
      verifiedOperator('op4', {
        eligibilityFlags: {
          canReceiveBookings: false,
          bankDetailsActive: false,
          onboardingComplete: false,
          paymentSlaFlagged: true,
        },
      })
    );

    Repository.createPaymentDetails(
      { userId: 'op4', role: 'operator' },
      {
        operatorId: 'op4',
        details: {
          accountHolderName: 'Operator Four Ltd',
          bankName: 'Example Business Bank',
          sortCode: '60-00-00',
          accountNumber: '66667777',
          currency: 'GBP',
          country: 'GB',
        },
        phoneConfirmation: { confirmed: true, phoneLastFour: '0000' },
      }
    );

    expect(await Repository.isOperatorBookable('op4')).toBe(false);
  });

  it('prevents booking intents for non-bookable operators', async () => {
    const offer = saveRequestAndOffer('op2');

    await expect(async () => await Repository.createBookingIntent(customerCtx, {
        offerId: offer.id,
        operatorId: 'op2',
        skipProofAcknowledged: true,
      })
    ).rejects.toThrow('Operator is not eligible to receive bookings');
  });
});
