import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockDB } from '../lib/api/mock-db';
import { Repository, RequestContext } from '../lib/api/repository';
import { Offer, PaymentDetailsInput, QuoteRequest } from '../lib/types';

const customerCtx: RequestContext = { userId: 'cust1', role: 'customer' };
const operatorCtx: RequestContext = { userId: 'op1', role: 'operator' };
const otherOperatorCtx: RequestContext = { userId: 'op2', role: 'operator' };
const adminCtx: RequestContext = { userId: 'admin1', role: 'admin' };

const paymentDetails = (overrides: Partial<PaymentDetailsInput> = {}): PaymentDetailsInput => ({
  accountHolderName: 'Al-Hidayah Travel Ltd',
  bankName: 'Example Business Bank',
  sortCode: '20-00-00',
  accountNumber: '12345678',
  currency: 'GBP',
  country: 'GB',
  ...overrides,
});

const createBookingIntentForOp1 = async () => {
  const request: QuoteRequest = {
    id: 'req-bank-1',
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
    id: 'offer-bank-1',
    requestId: request.id,
    operatorId: 'op1',
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
  await Repository.createOffer(operatorCtx, offer);

  return await Repository.createBookingIntent(customerCtx, {
    offerId: offer.id,
    operatorId: 'op1',
    skipProofAcknowledged: true,
  });
};

describe('bank details repository methods', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('seeds one verified operator with active payment details and exposes instructions only in-app', async () => {
    const intent = await createBookingIntentForOp1();

    const instructions = await Repository.getPaymentInstructions(customerCtx, intent.id);

    expect(instructions.operatorId).toBe('op1');
    expect(instructions.accountHolderName).toBe('Al-Hidayah Travel Ltd');
    expect(instructions.accountNumber).toBe('12345678');
    expect(instructions.delivery).toBe('in_app_only');
    expect(instructions.disclosure).toContain('PilgrimCompare does not collect, hold, or transfer customer funds');
  });

  it('rejects payment instruction access for unrelated customers and operators', async () => {
    const intent = await createBookingIntentForOp1();

    await expect(async () => await Repository.getPaymentInstructions({ userId: 'cust2', role: 'customer' }, intent.id)
    ).rejects.toThrow('Unauthorized');
    await expect(async () => await Repository.getPaymentInstructions(otherOperatorCtx, intent.id)).rejects.toThrow('Unauthorized');
  });

  it('requires operator ownership and phone-confirmation stub for initial payment details capture', async () => {
    await expect(async () => await Repository.createPaymentDetails(customerCtx, {
        operatorId: 'op2',
        details: paymentDetails({ accountNumber: '87654321' }),
        phoneConfirmation: { confirmed: true, phoneLastFour: '7821' },
      })
    ).rejects.toThrow('Unauthorized');

    await expect(async () => await Repository.createPaymentDetails(otherOperatorCtx, {
        operatorId: 'op2',
        details: paymentDetails({ accountNumber: '87654321' }),
        phoneConfirmation: { confirmed: false, phoneLastFour: '7821' },
      })
    ).rejects.toThrow('Phone confirmation is required');

    const created = await Repository.createPaymentDetails(otherOperatorCtx, {
      operatorId: 'op2',
      details: paymentDetails({ accountNumber: '87654321' }),
      phoneConfirmation: { confirmed: true, phoneLastFour: '7821' },
    });

    expect(created.phoneVerifiedAt).toBeTruthy();
    expect(created.phoneLastFour).toBe('7821');
    expect(created.status).toBe('active');
  });

  it('routes bank changes through admin approval, cooling period, lazy activation, and audit logs', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T10:00:00.000Z'));

    const intent = await createBookingIntentForOp1();
    const before = await Repository.getPaymentInstructions(customerCtx, intent.id);
    expect(before.accountNumber).toBe('12345678');

    const request = await Repository.createBankChangeRequest(operatorCtx, {
      operatorId: 'op1',
      proposedDetails: paymentDetails({
        bankName: 'New Review Bank',
        sortCode: '30-00-00',
        accountNumber: '22223333',
      }),
      phoneConfirmation: { confirmed: true, phoneLastFour: '4567' },
      reason: 'Moved business account',
    });

    const approved = await Repository.approveBankChangeRequest(adminCtx, request.id, 'Reviewed in admin queue');
    expect(approved.status).toBe('approved');
    expect(approved.activationEligibleAt).toBe('2026-06-02T10:00:00.000Z');

    expect((await Repository.getPaymentInstructions(customerCtx, intent.id)).accountNumber).toBe('12345678');

    vi.setSystemTime(new Date('2026-06-02T10:00:01.000Z'));
    const after = await Repository.getPaymentInstructions(customerCtx, intent.id);

    expect(after.bankName).toBe('New Review Bank');
    expect(after.accountNumber).toBe('22223333');
    expect(MockDB.getBankChangeRequests().find((candidate) => candidate.id === request.id)?.status).toBe('activated');
    expect((await Repository.getAuditLog(adminCtx)).map((entry) => entry.action)).toEqual([
      'bank_change.requested',
      'bank_change.approved',
      'bank_change.activated',
    ]);
  });

  it('supports rejection and cancellation without activating proposed details', async () => {
    const rejectedRequest = await Repository.createBankChangeRequest(operatorCtx, {
      operatorId: 'op1',
      proposedDetails: paymentDetails({ accountNumber: '11112222' }),
      phoneConfirmation: { confirmed: true, phoneLastFour: '4567' },
    });
    expect((await Repository.rejectBankChangeRequest(adminCtx, rejectedRequest.id, 'Sort code mismatch')).status).toBe('rejected');

    const cancelledRequest = await Repository.createBankChangeRequest(operatorCtx, {
      operatorId: 'op1',
      proposedDetails: paymentDetails({ accountNumber: '33334444' }),
      phoneConfirmation: { confirmed: true, phoneLastFour: '4567' },
    });
    await expect(async () => await Repository.cancelBankChangeRequest(otherOperatorCtx, cancelledRequest.id)).rejects.toThrow('Unauthorized');
    expect((await Repository.cancelBankChangeRequest(operatorCtx, cancelledRequest.id)).status).toBe('cancelled');
  });

  it('getPaymentDetails triggers lazy-activation and is RBAC-gated', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T10:00:00.000Z'));

    const request = await Repository.createBankChangeRequest(operatorCtx, {
      operatorId: 'op1',
      proposedDetails: paymentDetails({ accountNumber: '55556666', bankName: 'Lazy Bank' }),
      phoneConfirmation: { confirmed: true, phoneLastFour: '4567' },
    });
    await Repository.approveBankChangeRequest(adminCtx, request.id);

    // Before cooling — still old details
    expect((await Repository.getPaymentDetails(operatorCtx, 'op1'))?.accountNumber).toBe('12345678');

    // After cooling — lazy-activated
    vi.setSystemTime(new Date('2026-06-02T10:00:01.000Z'));
    const activated = await Repository.getPaymentDetails(operatorCtx, 'op1');
    expect(activated?.accountNumber).toBe('55556666');
    expect(activated?.bankName).toBe('Lazy Bank');

    // RBAC: other operator denied
    await expect(Repository.getPaymentDetails(otherOperatorCtx, 'op1')).rejects.toThrow('Unauthorized');
    // RBAC: admin allowed
    expect((await Repository.getPaymentDetails(adminCtx, 'op1'))?.accountNumber).toBe('55556666');
  });

  it('getOperatorAuditLog returns operator-scoped entries reverse-chronologically with RBAC', async () => {
    // Generate an audit entry first
    await Repository.createBankChangeRequest(operatorCtx, {
      operatorId: 'op1',
      proposedDetails: paymentDetails({ accountNumber: '77778888' }),
      phoneConfirmation: { confirmed: true, phoneLastFour: '4567' },
    });

    const entries = await Repository.getOperatorAuditLog(operatorCtx, 'op1');
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((e) => e.operatorId === 'op1')).toBe(true);

    // Reverse chronological
    for (let i = 1; i < entries.length; i += 1) {
      expect(new Date(entries[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(entries[i].createdAt).getTime()
      );
    }

    // RBAC: other operator denied
    await expect(Repository.getOperatorAuditLog(otherOperatorCtx, 'op1')).rejects.toThrow('Unauthorized');
    // RBAC: admin allowed
    expect((await Repository.getOperatorAuditLog(adminCtx, 'op1')).length).toBeGreaterThan(0);
  });
});
