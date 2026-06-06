import { MockDB } from './mock-db';
import {
  AuditLogEntry,
  BankChangeRequest,
  BookingIntent,
  BookingPaymentEvidence,
  BookingPaymentEvidenceFile,
  Complaint,
  ComplaintCategory,
  ComplaintSeverity,
  ComplaintStatus,
  Offer,
  OperatorProfile,
  Package,
  PaymentDetails,
  PaymentDetailsInput,
  PaymentInstructions,
  PaymentPhoneConfirmation,
  QuoteRequest,
  UserRole,
} from '@/lib/types';
import { generateSlug } from '@/lib/slug';
import { getDataSource } from '@/lib/config';
import { AppError } from '@/lib/errors';

/**
 * MockDB wrapper with async interface matching DBAdapter.
 * Used for tests and client-side fallback.
 */
const mockStore = {
  getPackages: () => Promise.resolve(MockDB.getPackages()),
  getOperators: () => Promise.resolve(MockDB.getOperators()),
  getOperatorById: (id: string) => Promise.resolve(MockDB.getOperatorById(id)),
  getRequests: () => Promise.resolve(MockDB.getRequests()),
  getRequestById: (id: string) => Promise.resolve(MockDB.getRequestById(id)),
  getOffers: () => Promise.resolve(MockDB.getOffers()),
  getOffersByRequestId: (requestId: string) => Promise.resolve(MockDB.getOffersByRequestId(requestId)),
  getBookingIntents: () => Promise.resolve(MockDB.getBookingIntents()),
  getPaymentDetails: () => Promise.resolve(MockDB.getPaymentDetails()),
  getBankChangeRequests: () => Promise.resolve(MockDB.getBankChangeRequests()),
  getAuditLog: () => Promise.resolve(MockDB.getAuditLog()),
  getComplaints: () => Promise.resolve(MockDB.getComplaints()),
  savePackage: (pkg: Package) => Promise.resolve(MockDB.savePackage(pkg)),
  saveOperator: (op: OperatorProfile) => Promise.resolve(MockDB.saveOperator(op)),
  saveRequest: (req: QuoteRequest) => Promise.resolve(MockDB.saveRequest(req)),
  saveOffer: (offer: Offer) => Promise.resolve(MockDB.saveOffer(offer)),
  saveBookingIntent: (bi: BookingIntent) => Promise.resolve(MockDB.saveBookingIntent(bi)),
  savePaymentDetails: (pd: PaymentDetails) => Promise.resolve(MockDB.savePaymentDetails(pd)),
  saveBankChangeRequest: (bcr: BankChangeRequest) => Promise.resolve(MockDB.saveBankChangeRequest(bcr)),
  saveAuditLogEntry: (entry: AuditLogEntry) => Promise.resolve(MockDB.saveAuditLogEntry(entry)),
  saveComplaint: (c: Complaint) => Promise.resolve(MockDB.saveComplaint(c)),
  deletePackage: (id: string) => Promise.resolve(MockDB.deletePackage(id)),
};

/**
 * Select the active data store.
 * - Client-side: always MockDB (Prisma is server-only)
 * - Production server (getDataSource() === 'prisma'): Prisma/Postgres via DBAdapter
 * - Tests & dev server (getDataSource() === 'mockdb'): MockDB
 *
 * Uses dynamic import() for server-only module loading. The import path
 * is constructed to prevent webpack from bundling the Prisma client
 * into client-side code.
 */
let prismaAdapter: typeof mockStore | null = null;

async function loadPrismaAdapter(): Promise<typeof mockStore> {
  if (prismaAdapter) return prismaAdapter;
  // webpackIgnore prevents webpack from tracing this import into the client bundle.
  // This path only executes server-side when getDataSource() === 'prisma'.
  const mod = await import(/* webpackIgnore: true */ './db/adapter' as string);
  prismaAdapter = (mod as typeof import('./db/adapter')).DBAdapter as unknown as typeof mockStore;
  return prismaAdapter;
}

function store(): typeof mockStore {
  if (typeof window !== 'undefined') {
    // Client-side: Prisma is not available; always use MockDB
    return mockStore;
  }
  if (getDataSource() === 'prisma') {
    // Server-side only: lazy-load Prisma adapter via dynamic import
    // This returns a Promise-like store; callers must await store() calls
    return new Proxy(mockStore, {
      get(_target, prop) {
        return async (...args: unknown[]) => {
          const adapter = await loadPrismaAdapter();
          const method = (adapter as Record<string, unknown>)[String(prop)];
          if (typeof method === 'function') {
            return (method as (...a: unknown[]) => unknown)(...args);
          }
          throw new Error(`DBAdapter method ${String(prop)} not found`);
        };
      },
    }) as unknown as typeof mockStore;
  }
  return mockStore;
}

// Simulate a secure context from the server (e.g. session)
export interface RequestContext {
  userId: string;
  role: UserRole;
}

const REFERENCE_CODE_PREFIX = 'KT';
const MAX_REFERENCE_CODE_ATTEMPTS = 10;
const BANK_CHANGE_COOLING_PERIOD_MS = 24 * 60 * 60 * 1000;
const PAY_OPERATOR_DIRECT_DISCLOSURE =
  'You pay the operator directly. KaabaTrip does not collect, hold, or transfer customer funds. The operator is the contracting party and is responsible for package fulfilment, payment records, and any payment outcome.';

const isAcceptedEvidenceFile = (file: BookingPaymentEvidenceFile) =>
  (file.kind === 'image' && file.mimeType.startsWith('image/')) ||
  (file.kind === 'pdf' && file.mimeType === 'application/pdf');

const cleanOptionalText = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const requireAdmin = (ctx: RequestContext) => {
  if (ctx.role !== 'admin') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
};

const requireOperatorOwner = (ctx: RequestContext, operatorId: string) => {
  if (ctx.role !== 'operator' || ctx.userId !== operatorId)
    throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
};

const requireOperatorOwnerOrAdmin = (ctx: RequestContext, operatorId: string) => {
  if (ctx.role === 'admin') return;
  if (ctx.role === 'operator' && ctx.userId === operatorId) return;
  throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
};

const normalizeSortCode = (sortCode: string) => {
  const trimmed = sortCode.trim();
  if (!/^\d{2}-?\d{2}-?\d{2}$/.test(trimmed)) throw new Error('Sort code must be 6 digits');
  const digits = trimmed.replace(/\D/g, '');
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
};

const normalizeAccountNumber = (accountNumber: string) => {
  const trimmed = accountNumber.trim();
  if (!/^\d{8}$/.test(trimmed)) throw new Error('Account number must be 8 digits');
  return trimmed;
};

const preparePaymentDetailsInput = (details: PaymentDetailsInput): PaymentDetailsInput => {
  const accountHolderName = details.accountHolderName.trim();
  const bankName = details.bankName.trim();
  const currency = details.currency.trim().toUpperCase();
  const country = details.country.trim().toUpperCase();

  if (!accountHolderName) throw new Error('Account holder name is required');
  if (!bankName) throw new Error('Bank name is required');
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Currency must be an ISO 4217 code');
  if (!/^[A-Z]{2}$/.test(country)) throw new Error('Country must be an ISO 3166-1 alpha-2 code');

  return {
    accountHolderName,
    bankName,
    sortCode: normalizeSortCode(details.sortCode),
    accountNumber: normalizeAccountNumber(details.accountNumber),
    currency,
    country,
  };
};

const requirePhoneConfirmation = (phoneConfirmation: PaymentPhoneConfirmation) => {
  if (!phoneConfirmation.confirmed) throw new Error('Phone confirmation is required');
  const phoneLastFour = phoneConfirmation.phoneLastFour.trim();
  if (!/^\d{4}$/.test(phoneLastFour)) throw new Error('Phone last four must be 4 digits');

  return {
    phoneVerifiedAt: new Date().toISOString(),
    phoneLastFour,
  };
};

const getActivePaymentDetails = async (operatorId: string) =>
  (await store().getPaymentDetails()).find(
    (paymentDetails) => paymentDetails.operatorId === operatorId && paymentDetails.status === 'active'
  );

const writeAuditLog = async (
  ctx: RequestContext,
  entry: Omit<AuditLogEntry, 'id' | 'actorUserId' | 'actorRole' | 'createdAt'>
) =>
  store().saveAuditLogEntry({
    ...entry,
    id: crypto.randomUUID(),
    actorUserId: ctx.userId,
    actorRole: ctx.role,
    createdAt: new Date().toISOString(),
  });

const updateOperatorEligibility = async (operatorId: string) => {
  const operator = await store().getOperatorById(operatorId);
  if (!operator) return undefined;

  const activePaymentDetails = await getActivePaymentDetails(operatorId);
  const flags = operator.eligibilityFlags ?? {
    canReceiveBookings: false,
    bankDetailsActive: false,
    onboardingComplete: false,
  };
  const canReceiveBookings =
    operator.verificationStatus === 'verified' &&
    operator.tier !== 'listed' &&
    Boolean(activePaymentDetails) &&
    flags.paymentSlaFlagged !== true;

  return store().saveOperator({
    ...operator,
    eligibilityFlags: {
      ...flags,
      bankDetailsActive: Boolean(activePaymentDetails),
      onboardingComplete: flags.onboardingComplete || Boolean(activePaymentDetails),
      canReceiveBookings,
    },
  });
};

const writeSystemAuditLog = async (entry: Omit<AuditLogEntry, 'id' | 'actorUserId' | 'actorRole' | 'createdAt'>) =>
  store().saveAuditLogEntry({
    ...entry,
    id: crypto.randomUUID(),
    actorUserId: 'system',
    actorRole: 'admin',
    createdAt: new Date().toISOString(),
  });

const activateEligibleBankChangeRequests = async (operatorId: string) => {
  const now = new Date();
  const requests = (await store().getBankChangeRequests()).filter(
    (request) =>
      request.operatorId === operatorId &&
      request.status === 'approved' &&
      request.activationEligibleAt &&
      new Date(request.activationEligibleAt) <= now
  );

  for (const request of requests) {
    const timestamp = new Date().toISOString();
    const currentActive = await getActivePaymentDetails(operatorId);
    if (currentActive) {
      await store().savePaymentDetails({
        ...currentActive,
        status: 'superseded',
        updatedAt: timestamp,
        supersededAt: timestamp,
      });
    }

    const activatedDetails: PaymentDetails = {
      ...request.proposedDetails,
      id: crypto.randomUUID(),
      operatorId,
      status: 'active',
      createdAt: request.requestedAt,
      updatedAt: timestamp,
      activatedAt: timestamp,
      createdByUserId: request.requestedByUserId,
      phoneVerifiedAt: request.phoneVerifiedAt,
      phoneLastFour: request.phoneLastFour,
    };
    await store().savePaymentDetails(activatedDetails);
    await store().saveBankChangeRequest({
      ...request,
      status: 'activated',
      activatedAt: timestamp,
    });
    await writeSystemAuditLog({
      action: 'bank_change.activated',
      operatorId,
      targetType: 'bank_change_request',
      targetId: request.id,
      metadata: {
        paymentDetailsId: activatedDetails.id,
        previousPaymentDetailsId: currentActive?.id ?? null,
      },
    });
  }

  if (requests.length > 0) await updateOperatorEligibility(operatorId);
};

const isOperatorBookableById = async (operatorId: string) => {
  await activateEligibleBankChangeRequests(operatorId);
  const operator = await store().getOperatorById(operatorId);
  if (!operator) return false;

  return (
    operator.verificationStatus === 'verified' &&
    operator.tier !== 'listed' &&
    operator.eligibilityFlags?.canReceiveBookings === true &&
    operator.eligibilityFlags.bankDetailsActive === true &&
    Boolean(await getActivePaymentDetails(operatorId))
  );
};

const generateReferenceCode = (existingCodes: Set<string>) => {
  for (let attempt = 0; attempt < MAX_REFERENCE_CODE_ATTEMPTS; attempt += 1) {
    const code = `${REFERENCE_CODE_PREFIX}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    if (!existingCodes.has(code)) return code;
  }

  throw new Error('Unable to generate unique reference code');
};

const requireComplaintAccess = (ctx: RequestContext, complaint: Complaint) => {
  if (ctx.role === 'admin') return;
  if (ctx.role === 'customer' && ctx.userId === complaint.customerId) return;
  if (ctx.role === 'operator' && ctx.userId === complaint.operatorId) return;
  throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
};

const requireComplaintOperatorAccess = (ctx: RequestContext, complaint: Complaint) => {
  if (ctx.role === 'operator' && ctx.userId === complaint.operatorId) return;
  throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
};

const VALID_COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'payment_issue',
  'service_quality',
  'package_description',
  'booking_problem',
  'other',
];

const VALID_COMPLAINT_SEVERITIES: ComplaintSeverity[] = ['low', 'medium', 'high'];

const normalizeComplaintDescription = (description: string) => {
  const trimmed = description.trim();
  if (!trimmed) throw new Error('Description is required');
  if (trimmed.length < 10) throw new Error('Description must be at least 10 characters');
  return trimmed;
};

const EVIDENCE_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

const preparePaymentEvidence = (paymentEvidence?: BookingPaymentEvidence): BookingPaymentEvidence | undefined => {
  if (!paymentEvidence) return undefined;

  const files = paymentEvidence.files ?? [];
  if (files.length === 0) return undefined;

  const invalidFile = files.find((file) => !isAcceptedEvidenceFile(file));
  if (invalidFile) throw new Error('Payment evidence must be an image or PDF');

  const submittedAt = paymentEvidence.submittedAt || new Date().toISOString();
  const hasBytes = files.some((f) => typeof f.base64Data === 'string' && f.base64Data.length > 0);
  const retentionExpiresAt = new Date(Date.now() + EVIDENCE_RETENTION_MS).toISOString();

  return {
    files,
    payerName: cleanOptionalText(paymentEvidence.payerName),
    paymentReference: cleanOptionalText(paymentEvidence.paymentReference),
    notes: cleanOptionalText(paymentEvidence.notes),
    submittedAt,
    storageStatus: hasBytes ? 'bytes-stored' : 'metadata-only',
    disputeFlag: paymentEvidence.disputeFlag ?? false,
    retentionExpiresAt,
  };
};

const pruneExpiredEvidence = (bookingIntent: BookingIntent): BookingIntent => {
  if (!bookingIntent.paymentEvidence) return bookingIntent;
  const now = Date.now();
  const expires = bookingIntent.paymentEvidence.retentionExpiresAt
    ? new Date(bookingIntent.paymentEvidence.retentionExpiresAt).getTime()
    : 0;
  const isDisputed = bookingIntent.paymentEvidence.disputeFlag === true;

  if (!isDisputed && expires > 0 && expires <= now) {
    const pruned: BookingPaymentEvidence = {
      ...bookingIntent.paymentEvidence,
      storageStatus: 'metadata-only',
      files: bookingIntent.paymentEvidence.files.map((f) => ({
        ...f,
        base64Data: undefined,
      })),
    };
    return { ...bookingIntent, paymentEvidence: pruned };
  }
  return bookingIntent;
};

const requireBookingIntentEvidenceAccess = (ctx: RequestContext, bookingIntent: BookingIntent) => {
  if (ctx.role === 'admin') return;
  if (ctx.role === 'customer' && ctx.userId === bookingIntent.customerId) return;
  if (ctx.role === 'operator' && ctx.userId === bookingIntent.operatorId) return;
  throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
};

export const Repository = {
  // Quote Requests
  getRequests: async (ctx: RequestContext): Promise<QuoteRequest[]> => {
    const all = await store().getRequests();
    if (ctx.role === 'customer') {
      return all.filter((r) => r.customerId === ctx.userId);
    }
    if (ctx.role === 'operator') {
      const allOffers = await store().getOffers();
      return all.filter(
        (r) => r.status === 'open' || allOffers.some((o) => o.requestId === r.id && o.operatorId === ctx.userId)
      );
    }
    return all; // Admin
  },

  getRequestById: async (ctx: RequestContext, id: string): Promise<QuoteRequest | undefined> => {
    const req = await store().getRequestById(id);
    if (!req) return undefined;

    if (ctx.role === 'customer' && req.customerId !== ctx.userId) return undefined;
    if (ctx.role === 'operator') {
      const offers = await store().getOffersByRequestId(id);
      const hasOffer = offers.some((o) => o.operatorId === ctx.userId);
      if (req.status !== 'open' && !hasOffer) return undefined;
    }
    return req;
  },

  // Offers
  getOffersForRequest: async (ctx: RequestContext, requestId: string): Promise<Offer[]> => {
    const all = await store().getOffersByRequestId(requestId);
    if (ctx.role === 'customer') {
      const req = await store().getRequestById(requestId);
      if (req?.customerId !== ctx.userId) return [];
      return all;
    }
    if (ctx.role === 'operator') {
      return all.filter((o) => o.operatorId === ctx.userId);
    }
    return all;
  },

  createOffer: async (ctx: RequestContext, offer: Offer): Promise<Offer> => {
    if (ctx.role !== 'operator') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
    const secureOffer = { ...offer, operatorId: ctx.userId };
    return store().saveOffer(secureOffer);
  },

  // Booking Intents
  createBookingIntent: async (ctx: RequestContext, intent: Partial<BookingIntent>): Promise<BookingIntent> => {
    if (ctx.role !== 'customer') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
    if (!intent.offerId) throw new Error('Offer is required');
    if (!intent.operatorId) throw new Error('Operator is required');

    const allOffers = await store().getOffers();
    const offer = allOffers.find((candidate) => candidate.id === intent.offerId);
    if (!offer) throw new Error('Offer not found');
    if (offer.operatorId !== intent.operatorId) throw new Error('Operator does not match offer');
    if (!await isOperatorBookableById(offer.operatorId)) throw new Error('Operator is not eligible to receive bookings');

    const request = await store().getRequestById(offer.requestId);
    if (!request || request.customerId !== ctx.userId) throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    const paymentEvidence = preparePaymentEvidence(intent.paymentEvidence);
    const hasEvidence = Boolean(paymentEvidence?.files.length);
    const skipProofAcknowledged = intent.skipProofAcknowledged === true;

    if (!hasEvidence && !skipProofAcknowledged) {
      throw new Error('Payment evidence or skip acknowledgement is required');
    }

    if (hasEvidence && skipProofAcknowledged) {
      throw new Error('Choose either payment evidence or skip proof acknowledgement');
    }

    const existingIntents = await store().getBookingIntents();
    const existingCodes = new Set(
      existingIntents
        .map((booking) => booking.referenceCode)
        .filter((referenceCode): referenceCode is string => Boolean(referenceCode))
    );
    const now = new Date().toISOString();

    const newIntent: BookingIntent = {
      id: crypto.randomUUID(),
      referenceCode: generateReferenceCode(existingCodes),
      offerId: offer.id,
      customerId: ctx.userId,
      operatorId: offer.operatorId,
      status: 'started',
      createdAt: now,
      updatedAt: now,
      paymentEvidence,
      skipProofAcknowledged,
      proofSkippedAt: skipProofAcknowledged ? now : undefined,
      notes: cleanOptionalText(intent.notes),
    };

    await store().saveBookingIntent(newIntent);
    return newIntent;
  },

  getBookingIntents: async (ctx: RequestContext): Promise<BookingIntent[]> => {
    const all = (await store().getBookingIntents()).map(pruneExpiredEvidence);
    if (ctx.role === 'customer') return all.filter((b) => b.customerId === ctx.userId);
    if (ctx.role === 'operator') return all.filter((b) => b.operatorId === ctx.userId);
    return all;
  },

  getEvidenceBytes: async (ctx: RequestContext, bookingIntentId: string): Promise<BookingPaymentEvidence | undefined> => {
    const bookingIntents = await store().getBookingIntents();
    const bookingIntent = bookingIntents.find((b) => b.id === bookingIntentId);
    if (!bookingIntent) throw new Error('Booking intent not found');
    requireBookingIntentEvidenceAccess(ctx, bookingIntent);

    const pruned = pruneExpiredEvidence(bookingIntent);
    // Check if evidence was actually pruned (storageStatus changed)
    const wasPruned = pruned.paymentEvidence?.storageStatus !== bookingIntent.paymentEvidence?.storageStatus;
    if (wasPruned) {
      await store().saveBookingIntent(pruned);
    }

    const evidence = pruned.paymentEvidence;
    if (!evidence) return undefined;
    if (evidence.storageStatus !== 'bytes-stored') {
      throw new Error('Evidence bytes have been purged or were never stored');
    }

    return evidence;
  },

  flagEvidenceForRetention: async (ctx: RequestContext, bookingIntentId: string): Promise<BookingIntent> => {
    requireAdmin(ctx);
    const bookingIntents = await store().getBookingIntents();
    const bookingIntent = bookingIntents.find((b) => b.id === bookingIntentId);
    if (!bookingIntent) throw new Error('Booking intent not found');
    if (!bookingIntent.paymentEvidence) throw new Error('No payment evidence to flag');

    const updated: BookingIntent = {
      ...bookingIntent,
      paymentEvidence: {
        ...bookingIntent.paymentEvidence,
        disputeFlag: true,
      },
      updatedAt: new Date().toISOString(),
    };
    await store().saveBookingIntent(updated);
    return updated;
  },

  // Operator payment details and eligibility
  createPaymentDetails: async (
    ctx: RequestContext,
    input: {
      operatorId: string;
      details: PaymentDetailsInput;
      phoneConfirmation: PaymentPhoneConfirmation;
    }
  ): Promise<PaymentDetails> => {
    requireOperatorOwner(ctx, input.operatorId);

    const operator = await store().getOperatorById(input.operatorId);
    if (!operator) throw new Error('Operator not found');
    if (await getActivePaymentDetails(input.operatorId)) {
      throw new Error('Active payment details already exist; use a bank change request');
    }

    const now = new Date().toISOString();
    const phone = requirePhoneConfirmation(input.phoneConfirmation);
    const paymentDetails: PaymentDetails = {
      ...preparePaymentDetailsInput(input.details),
      id: crypto.randomUUID(),
      operatorId: input.operatorId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      activatedAt: now,
      createdByUserId: ctx.userId,
      phoneVerifiedAt: phone.phoneVerifiedAt,
      phoneLastFour: phone.phoneLastFour,
    };

    await store().savePaymentDetails(paymentDetails);
    await updateOperatorEligibility(input.operatorId);
    await writeAuditLog(ctx, {
      action: 'payment_details.created',
      operatorId: input.operatorId,
      targetType: 'payment_details',
      targetId: paymentDetails.id,
      metadata: {
        accountNumberLastFour: paymentDetails.accountNumber.slice(-4),
        sortCodeLastTwo: paymentDetails.sortCode.slice(-2),
      },
    });

    return paymentDetails;
  },

  isOperatorBookable: async (operatorId: string): Promise<boolean> => isOperatorBookableById(operatorId),

  createBankChangeRequest: async (
    ctx: RequestContext,
    input: {
      operatorId: string;
      proposedDetails: PaymentDetailsInput;
      phoneConfirmation: PaymentPhoneConfirmation;
      reason?: string;
    }
  ): Promise<BankChangeRequest> => {
    requireOperatorOwner(ctx, input.operatorId);

    const currentPaymentDetails = await getActivePaymentDetails(input.operatorId);
    if (!currentPaymentDetails) throw new Error('Active payment details are required before requesting a change');

    const allRequests = await store().getBankChangeRequests();
    const pendingRequest = allRequests.find(
      (request) => request.operatorId === input.operatorId && request.status === 'pending_review'
    );
    if (pendingRequest) throw new Error('A bank change request is already pending review');

    const phone = requirePhoneConfirmation(input.phoneConfirmation);
    const request: BankChangeRequest = {
      id: crypto.randomUUID(),
      operatorId: input.operatorId,
      currentPaymentDetailsId: currentPaymentDetails.id,
      proposedDetails: preparePaymentDetailsInput(input.proposedDetails),
      status: 'pending_review',
      requestedByUserId: ctx.userId,
      requestedAt: new Date().toISOString(),
      reason: cleanOptionalText(input.reason),
      phoneVerifiedAt: phone.phoneVerifiedAt,
      phoneLastFour: phone.phoneLastFour,
    };

    await store().saveBankChangeRequest(request);
    await writeAuditLog(ctx, {
      action: 'bank_change.requested',
      operatorId: input.operatorId,
      targetType: 'bank_change_request',
      targetId: request.id,
      metadata: {
        currentPaymentDetailsId: currentPaymentDetails.id,
        accountNumberLastFour: request.proposedDetails.accountNumber.slice(-4),
      },
    });

    return request;
  },

  approveBankChangeRequest: async (ctx: RequestContext, requestId: string, reviewNotes?: string): Promise<BankChangeRequest> => {
    requireAdmin(ctx);

    const allRequests = await store().getBankChangeRequests();
    const request = allRequests.find((candidate) => candidate.id === requestId);
    if (!request) throw new Error('Bank change request not found');
    if (request.status !== 'pending_review') throw new Error('Only pending bank change requests can be approved');

    const reviewedAt = new Date().toISOString();
    const approved: BankChangeRequest = {
      ...request,
      status: 'approved',
      reviewedByUserId: ctx.userId,
      reviewedAt,
      reviewNotes: cleanOptionalText(reviewNotes),
      activationEligibleAt: new Date(Date.now() + BANK_CHANGE_COOLING_PERIOD_MS).toISOString(),
    };

    await store().saveBankChangeRequest(approved);
    await writeAuditLog(ctx, {
      action: 'bank_change.approved',
      operatorId: approved.operatorId,
      targetType: 'bank_change_request',
      targetId: approved.id,
      metadata: {
        activationEligibleAt: approved.activationEligibleAt ?? null,
      },
    });

    return approved;
  },

  rejectBankChangeRequest: async (ctx: RequestContext, requestId: string, reviewNotes: string): Promise<BankChangeRequest> => {
    requireAdmin(ctx);

    const allRequests = await store().getBankChangeRequests();
    const request = allRequests.find((candidate) => candidate.id === requestId);
    if (!request) throw new Error('Bank change request not found');
    if (request.status !== 'pending_review') throw new Error('Only pending bank change requests can be rejected');

    const trimmedNotes = reviewNotes?.trim();
    if (!trimmedNotes || trimmedNotes.length < 10) {
      throw new Error('Rejection reason must be at least 10 characters');
    }

    const rejected: BankChangeRequest = {
      ...request,
      status: 'rejected',
      reviewedByUserId: ctx.userId,
      reviewedAt: new Date().toISOString(),
      reviewNotes: cleanOptionalText(reviewNotes),
    };

    await store().saveBankChangeRequest(rejected);
    await writeAuditLog(ctx, {
      action: 'bank_change.rejected',
      operatorId: rejected.operatorId,
      targetType: 'bank_change_request',
      targetId: rejected.id,
    });

    return rejected;
  },

  cancelBankChangeRequest: async (ctx: RequestContext, requestId: string): Promise<BankChangeRequest> => {
    const allRequests = await store().getBankChangeRequests();
    const request = allRequests.find((candidate) => candidate.id === requestId);
    if (!request) throw new Error('Bank change request not found');
    requireOperatorOwner(ctx, request.operatorId);
    if (request.status !== 'pending_review' && request.status !== 'approved') {
      throw new Error('Only pending or approved bank change requests can be cancelled');
    }

    const cancelled: BankChangeRequest = {
      ...request,
      status: 'cancelled',
      cancelledByUserId: ctx.userId,
      cancelledAt: new Date().toISOString(),
    };

    await store().saveBankChangeRequest(cancelled);
    await writeAuditLog(ctx, {
      action: 'bank_change.cancelled',
      operatorId: cancelled.operatorId,
      targetType: 'bank_change_request',
      targetId: cancelled.id,
    });

    return cancelled;
  },

  getPaymentInstructions: async (ctx: RequestContext, bookingIntentId: string): Promise<PaymentInstructions> => {
    const bookingIntents = await store().getBookingIntents();
    const bookingIntent = bookingIntents.find((booking) => booking.id === bookingIntentId);
    if (!bookingIntent) throw new Error('Booking intent not found');

    const hasAccess =
      ctx.role === 'admin' ||
      (ctx.role === 'customer' && bookingIntent.customerId === ctx.userId) ||
      (ctx.role === 'operator' && bookingIntent.operatorId === ctx.userId);
    if (!hasAccess) throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    if (!await isOperatorBookableById(bookingIntent.operatorId)) {
      throw new Error('Operator is not eligible to receive bookings');
    }

    const paymentDetails = await getActivePaymentDetails(bookingIntent.operatorId);
    const operator = await store().getOperatorById(bookingIntent.operatorId);
    if (!paymentDetails || !operator) throw new Error('Payment instructions are unavailable');

    return {
      bookingIntentId,
      operatorId: bookingIntent.operatorId,
      operatorName: operator.companyName,
      paymentDetailsId: paymentDetails.id,
      accountHolderName: paymentDetails.accountHolderName,
      bankName: paymentDetails.bankName,
      sortCode: paymentDetails.sortCode,
      accountNumber: paymentDetails.accountNumber,
      currency: paymentDetails.currency,
      country: paymentDetails.country,
      disclosure: PAY_OPERATOR_DIRECT_DISCLOSURE,
      delivery: 'in_app_only',
    };
  },

  getPaymentDetails: async (ctx: RequestContext, operatorId: string): Promise<PaymentDetails | undefined> => {
    requireOperatorOwnerOrAdmin(ctx, operatorId);
    await activateEligibleBankChangeRequests(operatorId);
    return getActivePaymentDetails(operatorId);
  },

  getOperatorAuditLog: async (ctx: RequestContext, operatorId: string): Promise<AuditLogEntry[]> => {
    requireOperatorOwnerOrAdmin(ctx, operatorId);
    return (await store().getAuditLog())
      .filter((entry) => entry.operatorId === operatorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAuditLog: async (ctx: RequestContext): Promise<AuditLogEntry[]> => {
    requireAdmin(ctx);
    return store().getAuditLog();
  },

  // Operators
  createOperator: async (ctx: RequestContext, input: Partial<OperatorProfile>): Promise<OperatorProfile> => {
    if (!ctx.userId) throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    const now = new Date().toISOString();
    const operator: OperatorProfile = {
      ...input,
      id: ctx.userId,
      slug: input.companyName ? generateSlug(input.companyName) : `operator-${Date.now()}`,
      verificationStatus: 'pending',
      tier: 'listed',
      eligibilityFlags: {
        canReceiveBookings: false,
        bankDetailsActive: false,
        onboardingComplete: false,
      },
      createdAt: now,
      updatedAt: now,
    } as OperatorProfile;

    await store().saveOperator(operator);
    return operator;
  },

  updateOperator: async (ctx: RequestContext, id: string, updates: Partial<OperatorProfile>): Promise<OperatorProfile> => {
    requireOperatorOwnerOrAdmin(ctx, id);
    const existing = await store().getOperatorById(id);
    if (!existing) throw new Error('Operator not found');

    const operator: OperatorProfile = {
      ...existing,
      ...updates,
      id, // protect id
      updatedAt: new Date().toISOString(),
    };
    await store().saveOperator(operator);
    return operator;
  },

  verifyOperatorAtol: async (ctx: RequestContext, operatorId: string): Promise<OperatorProfile> => {
    requireAdmin(ctx);
    const existing = await store().getOperatorById(operatorId);
    if (!existing) throw new Error('Operator not found');
    const operator: OperatorProfile = {
      ...existing,
      atolVerifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await store().saveOperator(operator);
    return operator;
  },

  verifyOperatorAbta: async (ctx: RequestContext, operatorId: string): Promise<OperatorProfile> => {
    requireAdmin(ctx);
    const existing = await store().getOperatorById(operatorId);
    if (!existing) throw new Error('Operator not found');
    const operator: OperatorProfile = {
      ...existing,
      abtaVerifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await store().saveOperator(operator);
    return operator;
  },

  // Packages
  createPackage: async (ctx: RequestContext, pkg: Partial<Package>): Promise<Package> => {
    if (ctx.role !== 'operator') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    if (!pkg.title || !pkg.pricePerPerson) throw new Error('Missing required fields');

    const newPackage: Package = {
      ...pkg as Package,
      id: crypto.randomUUID(),
      operatorId: ctx.userId,
      slug: generateSlug(pkg.title) + '-' + Math.random().toString(36).substring(7),
    };

    return store().savePackage(newPackage);
  },

  listPackages: async (): Promise<Package[]> => {
    const all = await store().getPackages();
    return all.filter((p) => p.status === 'published');
  },

  getPackageBySlug: async (slug: string): Promise<Package | undefined> => {
    const all = await store().getPackages();
    return all.find((p) => p.slug === slug);
  },

  getPackagesByOperator: async (operatorId: string): Promise<Package[]> => {
    const all = await store().getPackages();
    return all.filter((p) => p.operatorId === operatorId);
  },

  exportPackagesAsCsv: async (ctx: RequestContext): Promise<string> => {
    if (ctx.role !== 'operator') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
    const packages = (await store().getPackages()).filter((p) => p.operatorId === ctx.userId);
    if (packages.length === 0) return '';

    const headers = [
      'title', 'slug', 'status', 'pilgrimageType', 'seasonLabel', 'dateWindowStart', 'dateWindowEnd',
      'priceType', 'pricePerPerson', 'currency', 'totalNights', 'nightsMakkah', 'nightsMadinah',
      'hotelMakkahStars', 'hotelMadinahStars', 'hotelMakkahName', 'hotelMadinahName',
      'distanceToHaramMakkahMetres', 'distanceToHaramMadinahMetres',
      'distanceBandMakkah', 'distanceBandMadinah', 'airline', 'departureAirport', 'flightType',
      'depositAmount', 'paymentPlanAvailable', 'cancellationPolicy', 'groupType',
      'visa', 'flights', 'transfers', 'meals',
      'single', 'double', 'triple', 'quad',
      'notes',
    ];

    const escapeCsv = (value: string | number | boolean | undefined) => {
      if (value === undefined || value === null) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = packages.map((pkg) => [
      pkg.title, pkg.slug, pkg.status, pkg.pilgrimageType, pkg.seasonLabel ?? '',
      pkg.dateWindow?.start ?? '', pkg.dateWindow?.end ?? '',
      pkg.priceType, pkg.pricePerPerson, pkg.currency, pkg.totalNights,
      pkg.nightsMakkah, pkg.nightsMadinah,
      pkg.hotelMakkahStars ?? '', pkg.hotelMadinahStars ?? '',
      pkg.hotelMakkahName ?? '', pkg.hotelMadinahName ?? '',
      pkg.distanceToHaramMakkahMetres ?? '', pkg.distanceToHaramMadinahMetres ?? '',
      pkg.distanceBandMakkah, pkg.distanceBandMadinah,
      pkg.airline ?? '', pkg.departureAirport ?? '', pkg.flightType ?? '',
      pkg.depositAmount ?? '', pkg.paymentPlanAvailable ?? '',
      pkg.cancellationPolicy ?? '', pkg.groupType ?? '',
      pkg.inclusions.visa, pkg.inclusions.flights, pkg.inclusions.transfers, pkg.inclusions.meals,
      pkg.roomOccupancyOptions.single, pkg.roomOccupancyOptions.double,
      pkg.roomOccupancyOptions.triple, pkg.roomOccupancyOptions.quad,
      pkg.notes ?? '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');
  },

  importPackagesFromCsv: async (ctx: RequestContext, csvText: string): Promise<{ saved: Package[]; errors: { row: number; reason: string }[] }> => {
    if (ctx.role !== 'operator') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('CSV must contain a header row and at least one data row');

    const headers = lines[0].split(',').map((h) => h.trim());
    const requiredColumns = ['title', 'pricePerPerson', 'currency', 'totalNights', 'pilgrimageType'];
    const missing = requiredColumns.filter((c) => !headers.includes(c));
    if (missing.length > 0) throw new Error(`Missing required columns: ${missing.join(', ')}`);

    const getValue = (row: string[], col: string): string => {
      const idx = headers.indexOf(col);
      return idx >= 0 ? row[idx]?.trim() ?? '' : '';
    };

    const saved: Package[] = [];
    const errors: { row: number; reason: string }[] = [];

    for (let i = 1; i < lines.length; i += 1) {
      const line = lines[i].trim();
      if (!line) continue;

      const cells: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j += 1) {
        const char = line[j];
        if (char === '"') {
          if (inQuotes && line[j + 1] === '"') {
            current += '"';
            j += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          cells.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      cells.push(current);

      const title = getValue(cells, 'title');
      const pricePerPerson = Number(getValue(cells, 'pricePerPerson'));
      const currency = getValue(cells, 'currency');
      const totalNights = Number(getValue(cells, 'totalNights'));
      const pilgrimageType = getValue(cells, 'pilgrimageType') as 'umrah' | 'hajj';

      if (!title) {
        errors.push({ row: i + 1, reason: 'Title is required' });
        continue;
      }
      if (Number.isNaN(pricePerPerson) || pricePerPerson <= 0) {
        errors.push({ row: i + 1, reason: 'Price per person must be a positive number' });
        continue;
      }
      if (!currency) {
        errors.push({ row: i + 1, reason: 'Currency is required' });
        continue;
      }
      if (Number.isNaN(totalNights) || totalNights <= 0) {
        errors.push({ row: i + 1, reason: 'Total nights must be a positive number' });
        continue;
      }
      if (pilgrimageType !== 'umrah' && pilgrimageType !== 'hajj') {
        errors.push({ row: i + 1, reason: 'Pilgrimage type must be umrah or hajj' });
        continue;
      }

      const status = getValue(cells, 'status') as 'draft' | 'published';
      const validStatus = status === 'published' ? 'published' : 'draft';

      const pkg: Package = {
        id: crypto.randomUUID(),
        operatorId: ctx.userId,
        title,
        slug: generateSlug(title) + '-' + Math.random().toString(36).substring(7),
        status: validStatus,
        pilgrimageType,
        seasonLabel: getValue(cells, 'seasonLabel') || undefined,
        dateWindow: getValue(cells, 'dateWindowStart')
          ? {
              start: getValue(cells, 'dateWindowStart'),
              end: getValue(cells, 'dateWindowEnd') || getValue(cells, 'dateWindowStart'),
            }
          : undefined,
        priceType: (getValue(cells, 'priceType') as Package['priceType']) || 'exact',
        pricePerPerson,
        currency,
        totalNights,
        nightsMakkah: Number(getValue(cells, 'nightsMakkah')) || totalNights,
        nightsMadinah: Number(getValue(cells, 'nightsMadinah')) || 0,
        hotelMakkahStars: ((): 3 | 4 | 5 | undefined => {
          const n = Number(getValue(cells, 'hotelMakkahStars'));
          return [3, 4, 5].includes(n) ? (n as 3 | 4 | 5) : undefined;
        })(),
        hotelMadinahStars: ((): 3 | 4 | 5 | undefined => {
          const n = Number(getValue(cells, 'hotelMadinahStars'));
          return [3, 4, 5].includes(n) ? (n as 3 | 4 | 5) : undefined;
        })(),
        hotelMakkahName: getValue(cells, 'hotelMakkahName') || undefined,
        hotelMadinahName: getValue(cells, 'hotelMadinahName') || undefined,
        distanceToHaramMakkahMetres: Number(getValue(cells, 'distanceToHaramMakkahMetres')) || undefined,
        distanceToHaramMadinahMetres: Number(getValue(cells, 'distanceToHaramMadinahMetres')) || undefined,
        distanceBandMakkah: (getValue(cells, 'distanceBandMakkah') as Package['distanceBandMakkah']) || 'unknown',
        distanceBandMadinah: (getValue(cells, 'distanceBandMadinah') as Package['distanceBandMadinah']) || 'unknown',
        airline: getValue(cells, 'airline') || undefined,
        departureAirport: getValue(cells, 'departureAirport') || undefined,
        flightType: (getValue(cells, 'flightType') as Package['flightType']) || undefined,
        depositAmount: Number(getValue(cells, 'depositAmount')) || undefined,
        paymentPlanAvailable: getValue(cells, 'paymentPlanAvailable') === 'true',
        cancellationPolicy: getValue(cells, 'cancellationPolicy') || undefined,
        groupType: (getValue(cells, 'groupType') as Package['groupType']) || undefined,
        roomOccupancyOptions: {
          single: getValue(cells, 'single') === 'true',
          double: getValue(cells, 'double') === 'true',
          triple: getValue(cells, 'triple') === 'true',
          quad: getValue(cells, 'quad') === 'true',
        },
        inclusions: {
          visa: getValue(cells, 'visa') === 'true',
          flights: getValue(cells, 'flights') === 'true',
          transfers: getValue(cells, 'transfers') === 'true',
          meals: getValue(cells, 'meals') === 'true',
        },
        notes: getValue(cells, 'notes') || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await store().savePackage(pkg);
      saved.push(pkg);
    }

    return { saved, errors };
  },

  getOperators: async (ctx: RequestContext): Promise<OperatorProfile[]> => {
    const all = await store().getOperators();
    if (ctx.role === 'operator') return all.filter((o) => o.id === ctx.userId);
    if (ctx.role === 'admin') return all;
    return [];
  },

  getOperatorById: async (id: string): Promise<OperatorProfile | undefined> => {
    return store().getOperatorById(id);
  },

  getOperatorBySlug: async (slug: string): Promise<OperatorProfile | undefined> => {
    return (await store().getOperators()).find((operator) => operator.slug === slug);
  },

  updatePackage: async (ctx: RequestContext, id: string, updates: Partial<Package>): Promise<Package> => {
    const all = await store().getPackages();
    const existing = all.find((p) => p.id === id);
    if (!existing) throw new Error('Not found');

    if (ctx.role !== 'operator' || existing.operatorId !== ctx.userId) {
      throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
    }

    const updated = { ...existing, ...updates, id, operatorId: existing.operatorId };
    return store().savePackage(updated);
  },

  deletePackage: async (ctx: RequestContext, id: string): Promise<void> => {
    const all = await store().getPackages();
    const existing = all.find((p) => p.id === id);
    if (!existing) return;

    if (ctx.role !== 'operator' || existing.operatorId !== ctx.userId) {
      throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
    }

    await store().deletePackage(id);
  },

  // Complaints
  createComplaint: async (
    ctx: RequestContext,
    input: {
      bookingIntentId: string;
      category: ComplaintCategory;
      severity: ComplaintSeverity;
      description: string;
    }
  ): Promise<Complaint> => {
    if (ctx.role !== 'customer') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    const bookingIntents = await store().getBookingIntents();
    const bookingIntent = bookingIntents.find((b) => b.id === input.bookingIntentId);
    if (!bookingIntent) throw new Error('Booking intent not found');
    if (bookingIntent.customerId !== ctx.userId)
      throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    if (!VALID_COMPLAINT_CATEGORIES.includes(input.category)) {
      throw new Error('Invalid complaint category');
    }
    if (!VALID_COMPLAINT_SEVERITIES.includes(input.severity)) {
      throw new Error('Invalid complaint severity');
    }

    const now = new Date().toISOString();
    const complaint: Complaint = {
      id: crypto.randomUUID(),
      bookingIntentId: input.bookingIntentId,
      referenceCode: bookingIntent.referenceCode ?? 'UNKNOWN',
      customerId: ctx.userId,
      operatorId: bookingIntent.operatorId,
      category: input.category,
      severity: input.severity,
      description: normalizeComplaintDescription(input.description),
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    };

    await store().saveComplaint(complaint);
    return complaint;
  },

  getComplaints: async (ctx: RequestContext): Promise<Complaint[]> => {
    const all = await store().getComplaints();
    if (ctx.role === 'customer') return all.filter((c) => c.customerId === ctx.userId);
    if (ctx.role === 'operator') return all.filter((c) => c.operatorId === ctx.userId);
    return all;
  },

  getComplaintById: async (ctx: RequestContext, id: string): Promise<Complaint | undefined> => {
    const complaints = await store().getComplaints();
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) return undefined;
    requireComplaintAccess(ctx, complaint);
    return complaint;
  },

  updateComplaintStatus: async (ctx: RequestContext, id: string, status: ComplaintStatus): Promise<Complaint> => {
    const complaints = await store().getComplaints();
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) throw new Error('Complaint not found');
    requireComplaintAccess(ctx, complaint);

    const allowedOperatorStatuses: ComplaintStatus[] = [
      'operator_responding',
      'resolved',
      'cannot_resolve',
    ];
    const allowedAdminStatuses: ComplaintStatus[] = ['admin_triage', 'resolved', 'closed'];

    if (ctx.role === 'operator') {
      if (!allowedOperatorStatuses.includes(status)) throw new Error('Operator cannot set this status');
    } else if (ctx.role === 'admin') {
      if (!allowedAdminStatuses.includes(status)) throw new Error('Admin cannot set this status');
    } else {
      throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
    }

    const updated: Complaint = {
      ...complaint,
      status,
      updatedAt: new Date().toISOString(),
    };
    await store().saveComplaint(updated);
    return updated;
  },

  updateComplaintOperatorResponse: async (ctx: RequestContext, id: string, response: string): Promise<Complaint> => {
    const complaints = await store().getComplaints();
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) throw new Error('Complaint not found');
    requireComplaintOperatorAccess(ctx, complaint);

    const trimmed = response.trim();
    if (!trimmed || trimmed.length < 5) throw new Error('Response must be at least 5 characters');

    const updated: Complaint = {
      ...complaint,
      operatorResponse: trimmed,
      operatorRespondedAt: new Date().toISOString(),
      status: complaint.status === 'submitted' ? 'operator_responding' : complaint.status,
      updatedAt: new Date().toISOString(),
    };
    await store().saveComplaint(updated);
    return updated;
  },

  updateComplaintAdminNotes: async (
    ctx: RequestContext,
    id: string,
    notes: string,
    flagOperator?: boolean
  ): Promise<Complaint> => {
    requireAdmin(ctx);
    const complaints = await store().getComplaints();
    const complaint = complaints.find((c) => c.id === id);
    if (!complaint) throw new Error('Complaint not found');

    const updated: Complaint = {
      ...complaint,
      adminNotes: notes.trim() || undefined,
      adminFlaggedOperator: flagOperator ?? complaint.adminFlaggedOperator,
      updatedAt: new Date().toISOString(),
    };
    await store().saveComplaint(updated);
    return updated;
  },
};
