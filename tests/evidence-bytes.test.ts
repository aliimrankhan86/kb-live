import { describe, it, expect, beforeEach } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import type { BookingPaymentEvidence } from '@/lib/types';

const customerCtx = { userId: 'cust1', role: 'customer' as const };
const operatorCtx = { userId: 'op1', role: 'operator' as const };
const adminCtx = { userId: 'admin1', role: 'admin' as const };
const otherOperatorCtx = { userId: 'op2', role: 'operator' as const };

describe('Evidence bytes storage', () => {
  beforeEach(() => {
    localStorage.clear();
    MockDB.setCurrentUser('customer');
    MockDB.saveOperator({
      id: 'op1',
      companyName: 'Test Operator',
      slug: 'test-operator',
      verificationStatus: 'verified',
      tier: 'verified',
      eligibilityFlags: { canReceiveBookings: true, bankDetailsActive: true, onboardingComplete: true },
      contactEmail: 'test@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    MockDB.savePaymentDetails({
      id: 'pay-op1-active',
      operatorId: 'op1',
      accountHolderName: 'Test Operator Ltd',
      bankName: 'Test Bank',
      sortCode: '20-00-00',
      accountNumber: '12345678',
      currency: 'GBP',
      country: 'GB',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      activatedAt: '2026-01-01T00:00:00.000Z',
      createdByUserId: 'op1',
      phoneVerifiedAt: '2026-01-01T00:00:00.000Z',
      phoneLastFour: '1234',
    });
    MockDB.saveRequest({
      id: 'req-evidence-1',
      customerId: 'cust1',
      status: 'open',
      createdAt: '2026-01-01T00:00:00.000Z',
      type: 'umrah',
      season: 'flexible',
      totalNights: 10,
      nightsMakkah: 5,
      nightsMadinah: 5,
      hotelStars: 4,
      distancePreference: 'medium',
      occupancy: { single: 0, double: 2, triple: 0, quad: 0 },
      inclusions: { visa: true, flights: true, transfers: true, meals: false },
    });
    MockDB.saveOffer({
      id: 'offer-test-1',
      requestId: 'req-evidence-1',
      operatorId: 'op1',
      createdAt: '2026-01-01T00:00:00.000Z',
      pricePerPerson: 1500,
      currency: 'GBP',
      totalNights: 10,
      nightsMakkah: 5,
      nightsMadinah: 5,
      hotelStars: 4,
      distanceToHaram: '500m',
      roomOccupancy: { single: false, double: true, triple: false, quad: false },
      inclusions: { visa: true, flights: true, transfers: true, meals: false },
    });
  });

  describe('preparePaymentEvidence', () => {
    it('stores metadata-only when no base64 data provided', async () => {
      const bi = await Repository.createBookingIntent(customerCtx, {
        offerId: 'offer-test-1',
        operatorId: 'op1',
        paymentEvidence: {
          files: [
            {
              id: 'f1',
              name: 'receipt.png',
              mimeType: 'image/png',
              sizeBytes: 1024,
              kind: 'image',
              uploadedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          submittedAt: '2026-01-01T00:00:00.000Z',
          storageStatus: 'metadata-only',
        },
      });
      expect(bi.paymentEvidence?.storageStatus).toBe('metadata-only');
      expect(bi.paymentEvidence?.files[0].base64Data).toBeUndefined();
      expect(bi.paymentEvidence?.retentionExpiresAt).toBeTruthy();
      expect(bi.paymentEvidence?.disputeFlag).toBe(false);
    });

    it('stores bytes-stored when base64 data provided', async () => {
      const bi = await Repository.createBookingIntent(customerCtx, {
        offerId: 'offer-test-1',
        operatorId: 'op1',
        paymentEvidence: {
          files: [
            {
              id: 'f1',
              name: 'receipt.png',
              mimeType: 'image/png',
              sizeBytes: 1024,
              kind: 'image',
              uploadedAt: '2026-01-01T00:00:00.000Z',
              base64Data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            },
          ],
          submittedAt: '2026-01-01T00:00:00.000Z',
          storageStatus: 'metadata-only',
        },
      });
      expect(bi.paymentEvidence?.storageStatus).toBe('bytes-stored');
      expect(bi.paymentEvidence?.files[0].base64Data).toBeTruthy();
      expect(bi.paymentEvidence?.retentionExpiresAt).toBeTruthy();
    });
  });

  describe('getEvidenceBytes', () => {
    it('returns evidence bytes for owner customer', async () => {
      const bi = await Repository.createBookingIntent(customerCtx, {
        offerId: 'offer-test-1',
        operatorId: 'op1',
        paymentEvidence: {
          files: [{ id: 'f1', name: 'r.png', mimeType: 'image/png', sizeBytes: 1, kind: 'image', uploadedAt: '2026-01-01T00:00:00.000Z', base64Data: 'data' }],
          submittedAt: '2026-01-01T00:00:00.000Z',
          storageStatus: 'metadata-only',
        },
      });
      const evidence = await Repository.getEvidenceBytes(customerCtx, bi.id);
      expect(evidence).toBeDefined();
      expect(evidence?.files[0].base64Data).toBe('data');
    });

    it('returns evidence bytes for involved operator', async () => {
      const bi = await Repository.createBookingIntent(customerCtx, {
        offerId: 'offer-test-1',
        operatorId: 'op1',
        paymentEvidence: {
          files: [{ id: 'f1', name: 'r.png', mimeType: 'image/png', sizeBytes: 1, kind: 'image', uploadedAt: '2026-01-01T00:00:00.000Z', base64Data: 'data' }],
          submittedAt: '2026-01-01T00:00:00.000Z',
          storageStatus: 'metadata-only',
        },
      });
      MockDB.setCurrentUser('operator');
      const evidence = await Repository.getEvidenceBytes(operatorCtx, bi.id);
      expect(evidence).toBeDefined();
    });

    it('returns evidence bytes for admin', async () => {
      const bi = await Repository.createBookingIntent(customerCtx, {
        offerId: 'offer-test-1',
        operatorId: 'op1',
        paymentEvidence: {
          files: [{ id: 'f1', name: 'r.png', mimeType: 'image/png', sizeBytes: 1, kind: 'image', uploadedAt: '2026-01-01T00:00:00.000Z', base64Data: 'data' }],
          submittedAt: '2026-01-01T00:00:00.000Z',
          storageStatus: 'metadata-only',
        },
      });
      MockDB.setCurrentUser('operator');
      const evidence = await Repository.getEvidenceBytes(adminCtx, bi.id);
      expect(evidence).toBeDefined();
    });

    it('blocks unrelated operator', async () => {
      const bi = await Repository.createBookingIntent(customerCtx, {
        offerId: 'offer-test-1',
        operatorId: 'op1',
        paymentEvidence: {
          files: [{ id: 'f1', name: 'r.png', mimeType: 'image/png', sizeBytes: 1, kind: 'image', uploadedAt: '2026-01-01T00:00:00.000Z', base64Data: 'data' }],
          submittedAt: '2026-01-01T00:00:00.000Z',
          storageStatus: 'metadata-only',
        },
      });
      MockDB.setCurrentUser('operator');
      await expect(Repository.getEvidenceBytes(otherOperatorCtx, bi.id)).rejects.toThrow('Unauthorized');
    });

    it('throws when bytes have been purged (metadata-only)', async () => {
      const bi = await Repository.createBookingIntent(customerCtx, {
        offerId: 'offer-test-1',
        operatorId: 'op1',
        paymentEvidence: {
          files: [{ id: 'f1', name: 'r.png', mimeType: 'image/png', sizeBytes: 1, kind: 'image', uploadedAt: '2026-01-01T00:00:00.000Z' }],
          submittedAt: '2026-01-01T00:00:00.000Z',
          storageStatus: 'metadata-only',
        },
      });
      await expect(Repository.getEvidenceBytes(customerCtx, bi.id)).rejects.toThrow('Evidence bytes have been purged or were never stored');
    });
  });

  describe('flagEvidenceForRetention', () => {
    it('allows admin to flag evidence for retention', async () => {
      const bi = await Repository.createBookingIntent(customerCtx, {
        offerId: 'offer-test-1',
        operatorId: 'op1',
        paymentEvidence: {
          files: [{ id: 'f1', name: 'r.png', mimeType: 'image/png', sizeBytes: 1, kind: 'image', uploadedAt: '2026-01-01T00:00:00.000Z', base64Data: 'data' }],
          submittedAt: '2026-01-01T00:00:00.000Z',
          storageStatus: 'metadata-only',
        },
      });
      MockDB.setCurrentUser('operator');
      const updated = await Repository.flagEvidenceForRetention(adminCtx, bi.id);
      expect(updated.paymentEvidence?.disputeFlag).toBe(true);
    });

    it('blocks non-admin from flagging', async () => {
      const bi = await Repository.createBookingIntent(customerCtx, {
        offerId: 'offer-test-1',
        operatorId: 'op1',
        paymentEvidence: {
          files: [{ id: 'f1', name: 'r.png', mimeType: 'image/png', sizeBytes: 1, kind: 'image', uploadedAt: '2026-01-01T00:00:00.000Z', base64Data: 'data' }],
          submittedAt: '2026-01-01T00:00:00.000Z',
          storageStatus: 'metadata-only',
        },
      });
      MockDB.setCurrentUser('operator');
      await expect(Repository.flagEvidenceForRetention(operatorCtx, bi.id)).rejects.toThrow('Unauthorized');
    });

    it('throws when no payment evidence exists', async () => {
      const bi = await Repository.createBookingIntent(customerCtx, {
        offerId: 'offer-test-1',
        operatorId: 'op1',
        skipProofAcknowledged: true,
      });
      MockDB.setCurrentUser('operator');
      await expect(Repository.flagEvidenceForRetention(adminCtx, bi.id)).rejects.toThrow('No payment evidence to flag');
    });
  });
});