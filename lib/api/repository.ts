import { MockDB } from './mock-db';
import {
  AuditLogEntry,
  BankChangeRequest,
  BookingIntent,
  BookingPaymentEvidence,
  BookingPaymentEvidenceFile,
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
  if (ctx.role !== 'admin') throw new Error('Unauthorized');
};

const requireOperatorOwner = (ctx: RequestContext, operatorId: string) => {
  if (ctx.role !== 'operator' || ctx.userId !== operatorId) throw new Error('Unauthorized');
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

const getActivePaymentDetails = (operatorId: string) =>
  MockDB.getPaymentDetails().find(
    (paymentDetails) => paymentDetails.operatorId === operatorId && paymentDetails.status === 'active'
  );

const writeAuditLog = (
  ctx: RequestContext,
  entry: Omit<AuditLogEntry, 'id' | 'actorUserId' | 'actorRole' | 'createdAt'>
) =>
  MockDB.saveAuditLogEntry({
    ...entry,
    id: crypto.randomUUID(),
    actorUserId: ctx.userId,
    actorRole: ctx.role,
    createdAt: new Date().toISOString(),
  });

const updateOperatorEligibility = (operatorId: string) => {
  const operator = MockDB.getOperatorById(operatorId);
  if (!operator) return undefined;

  const activePaymentDetails = getActivePaymentDetails(operatorId);
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

  return MockDB.saveOperator({
    ...operator,
    eligibilityFlags: {
      ...flags,
      bankDetailsActive: Boolean(activePaymentDetails),
      onboardingComplete: flags.onboardingComplete || Boolean(activePaymentDetails),
      canReceiveBookings,
    },
  });
};

const writeSystemAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'actorUserId' | 'actorRole' | 'createdAt'>) =>
  MockDB.saveAuditLogEntry({
    ...entry,
    id: crypto.randomUUID(),
    actorUserId: 'system',
    actorRole: 'admin',
    createdAt: new Date().toISOString(),
  });

const activateEligibleBankChangeRequests = (operatorId: string) => {
  const now = new Date();
  const requests = MockDB.getBankChangeRequests().filter(
    (request) =>
      request.operatorId === operatorId &&
      request.status === 'approved' &&
      request.activationEligibleAt &&
      new Date(request.activationEligibleAt) <= now
  );

  requests.forEach((request) => {
    const timestamp = new Date().toISOString();
    const currentActive = getActivePaymentDetails(operatorId);
    if (currentActive) {
      MockDB.savePaymentDetails({
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
    MockDB.savePaymentDetails(activatedDetails);
    MockDB.saveBankChangeRequest({
      ...request,
      status: 'activated',
      activatedAt: timestamp,
    });
    writeSystemAuditLog({
      action: 'bank_change.activated',
      operatorId,
      targetType: 'bank_change_request',
      targetId: request.id,
      metadata: {
        paymentDetailsId: activatedDetails.id,
        previousPaymentDetailsId: currentActive?.id ?? null,
      },
    });
  });

  if (requests.length > 0) updateOperatorEligibility(operatorId);
};

const isOperatorBookableById = (operatorId: string) => {
  activateEligibleBankChangeRequests(operatorId);
  const operator = MockDB.getOperatorById(operatorId);
  if (!operator) return false;

  return (
    operator.verificationStatus === 'verified' &&
    operator.tier !== 'listed' &&
    operator.eligibilityFlags?.canReceiveBookings === true &&
    operator.eligibilityFlags.bankDetailsActive === true &&
    Boolean(getActivePaymentDetails(operatorId))
  );
};

const generateReferenceCode = (existingCodes: Set<string>) => {
  for (let attempt = 0; attempt < MAX_REFERENCE_CODE_ATTEMPTS; attempt += 1) {
    const code = `${REFERENCE_CODE_PREFIX}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    if (!existingCodes.has(code)) return code;
  }

  throw new Error('Unable to generate unique reference code');
};

const preparePaymentEvidence = (paymentEvidence?: BookingPaymentEvidence): BookingPaymentEvidence | undefined => {
  if (!paymentEvidence) return undefined;

  const files = paymentEvidence.files ?? [];
  if (files.length === 0) return undefined;

  const invalidFile = files.find((file) => !isAcceptedEvidenceFile(file));
  if (invalidFile) throw new Error('Payment evidence must be an image or PDF');

  const submittedAt = paymentEvidence.submittedAt || new Date().toISOString();

  return {
    files,
    payerName: cleanOptionalText(paymentEvidence.payerName),
    paymentReference: cleanOptionalText(paymentEvidence.paymentReference),
    notes: cleanOptionalText(paymentEvidence.notes),
    submittedAt,
    storageStatus: 'metadata-only',
  };
};

export const Repository = {
  // Quote Requests
  getRequests: (ctx: RequestContext): QuoteRequest[] => {
    const all = MockDB.getRequests();
    if (ctx.role === 'customer') {
      return all.filter((r) => r.customerId === ctx.userId);
    }
    if (ctx.role === 'operator') {
      // Operators see all open requests to bid on
      // OR only requests they have already bid on
      // For MVP marketplace, they see all open requests + requests they responded to.
      return all.filter(r => r.status === 'open' || MockDB.getOffersByRequestId(r.id).some(o => o.operatorId === ctx.userId));
    }
    return all; // Admin
  },

  getRequestById: (ctx: RequestContext, id: string): QuoteRequest | undefined => {
    const req = MockDB.getRequestById(id);
    if (!req) return undefined;
    
    if (ctx.role === 'customer' && req.customerId !== ctx.userId) return undefined;
    // Operator can view if it's open or they have an offer
    if (ctx.role === 'operator') {
        const hasOffer = MockDB.getOffersByRequestId(id).some(o => o.operatorId === ctx.userId);
        if (req.status !== 'open' && !hasOffer) return undefined;
    }
    return req;
  },

  // Offers
  getOffersForRequest: (ctx: RequestContext, requestId: string): Offer[] => {
    const all = MockDB.getOffersByRequestId(requestId);
    if (ctx.role === 'customer') {
      // Customer sees all offers for their request
      const req = MockDB.getRequestById(requestId);
      if (req?.customerId !== ctx.userId) return [];
      return all;
    }
    if (ctx.role === 'operator') {
      // Operator sees ONLY their own offers
      return all.filter((o) => o.operatorId === ctx.userId);
    }
    return all;
  },

  createOffer: (ctx: RequestContext, offer: Offer): Offer => {
    if (ctx.role !== 'operator') throw new Error('Unauthorized');
    // Enforce operatorId
    const secureOffer = { ...offer, operatorId: ctx.userId };
    return MockDB.saveOffer(secureOffer);
  },

  // Booking Intents
  createBookingIntent: (ctx: RequestContext, intent: Partial<BookingIntent>): BookingIntent => {
    if (ctx.role !== 'customer') throw new Error('Unauthorized');
    if (!intent.offerId) throw new Error('Offer is required');
    if (!intent.operatorId) throw new Error('Operator is required');

    const offer = MockDB.getOffers().find((candidate) => candidate.id === intent.offerId);
    if (!offer) throw new Error('Offer not found');
    if (offer.operatorId !== intent.operatorId) throw new Error('Operator does not match offer');
    if (!isOperatorBookableById(offer.operatorId)) throw new Error('Operator is not eligible to receive bookings');

    const request = MockDB.getRequestById(offer.requestId);
    if (!request || request.customerId !== ctx.userId) throw new Error('Unauthorized');

    const paymentEvidence = preparePaymentEvidence(intent.paymentEvidence);
    const hasEvidence = Boolean(paymentEvidence?.files.length);
    const skipProofAcknowledged = intent.skipProofAcknowledged === true;

    if (!hasEvidence && !skipProofAcknowledged) {
      throw new Error('Payment evidence or skip acknowledgement is required');
    }

    if (hasEvidence && skipProofAcknowledged) {
      throw new Error('Choose either payment evidence or skip proof acknowledgement');
    }

    const existingCodes = new Set(
      MockDB.getBookingIntents()
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
    
    MockDB.saveBookingIntent(newIntent);
    return newIntent;
  },

  getBookingIntents: (ctx: RequestContext): BookingIntent[] => {
    const all = MockDB.getBookingIntents();
    if (ctx.role === 'customer') return all.filter(b => b.customerId === ctx.userId);
    if (ctx.role === 'operator') return all.filter(b => b.operatorId === ctx.userId);
    return all;
  },

  // Operator payment details and eligibility
  createPaymentDetails: (
    ctx: RequestContext,
    input: {
      operatorId: string;
      details: PaymentDetailsInput;
      phoneConfirmation: PaymentPhoneConfirmation;
    }
  ): PaymentDetails => {
    requireOperatorOwner(ctx, input.operatorId);

    const operator = MockDB.getOperatorById(input.operatorId);
    if (!operator) throw new Error('Operator not found');
    if (getActivePaymentDetails(input.operatorId)) {
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

    MockDB.savePaymentDetails(paymentDetails);
    updateOperatorEligibility(input.operatorId);
    writeAuditLog(ctx, {
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

  isOperatorBookable: (operatorId: string): boolean => isOperatorBookableById(operatorId),

  createBankChangeRequest: (
    ctx: RequestContext,
    input: {
      operatorId: string;
      proposedDetails: PaymentDetailsInput;
      phoneConfirmation: PaymentPhoneConfirmation;
      reason?: string;
    }
  ): BankChangeRequest => {
    requireOperatorOwner(ctx, input.operatorId);

    const currentPaymentDetails = getActivePaymentDetails(input.operatorId);
    if (!currentPaymentDetails) throw new Error('Active payment details are required before requesting a change');

    const pendingRequest = MockDB.getBankChangeRequests().find(
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

    MockDB.saveBankChangeRequest(request);
    writeAuditLog(ctx, {
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

  approveBankChangeRequest: (ctx: RequestContext, requestId: string, reviewNotes?: string): BankChangeRequest => {
    requireAdmin(ctx);

    const request = MockDB.getBankChangeRequests().find((candidate) => candidate.id === requestId);
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

    MockDB.saveBankChangeRequest(approved);
    writeAuditLog(ctx, {
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

  rejectBankChangeRequest: (ctx: RequestContext, requestId: string, reviewNotes: string): BankChangeRequest => {
    requireAdmin(ctx);

    const request = MockDB.getBankChangeRequests().find((candidate) => candidate.id === requestId);
    if (!request) throw new Error('Bank change request not found');
    if (request.status !== 'pending_review') throw new Error('Only pending bank change requests can be rejected');

    const rejected: BankChangeRequest = {
      ...request,
      status: 'rejected',
      reviewedByUserId: ctx.userId,
      reviewedAt: new Date().toISOString(),
      reviewNotes: cleanOptionalText(reviewNotes),
    };

    MockDB.saveBankChangeRequest(rejected);
    writeAuditLog(ctx, {
      action: 'bank_change.rejected',
      operatorId: rejected.operatorId,
      targetType: 'bank_change_request',
      targetId: rejected.id,
    });

    return rejected;
  },

  cancelBankChangeRequest: (ctx: RequestContext, requestId: string): BankChangeRequest => {
    const request = MockDB.getBankChangeRequests().find((candidate) => candidate.id === requestId);
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

    MockDB.saveBankChangeRequest(cancelled);
    writeAuditLog(ctx, {
      action: 'bank_change.cancelled',
      operatorId: cancelled.operatorId,
      targetType: 'bank_change_request',
      targetId: cancelled.id,
    });

    return cancelled;
  },

  getPaymentInstructions: (ctx: RequestContext, bookingIntentId: string): PaymentInstructions => {
    const bookingIntent = MockDB.getBookingIntents().find((booking) => booking.id === bookingIntentId);
    if (!bookingIntent) throw new Error('Booking intent not found');

    const hasAccess =
      ctx.role === 'admin' ||
      (ctx.role === 'customer' && bookingIntent.customerId === ctx.userId) ||
      (ctx.role === 'operator' && bookingIntent.operatorId === ctx.userId);
    if (!hasAccess) throw new Error('Unauthorized');

    if (!isOperatorBookableById(bookingIntent.operatorId)) {
      throw new Error('Operator is not eligible to receive bookings');
    }

    const paymentDetails = getActivePaymentDetails(bookingIntent.operatorId);
    const operator = MockDB.getOperatorById(bookingIntent.operatorId);
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

  getAuditLog: (ctx: RequestContext): AuditLogEntry[] => {
    requireAdmin(ctx);
    return MockDB.getAuditLog();
  },

  // Packages
  createPackage: (ctx: RequestContext, pkg: Partial<Package>): Package => {
    if (ctx.role !== 'operator') throw new Error('Unauthorized');
    
    // Validate required fields (basic check)
    if (!pkg.title || !pkg.pricePerPerson) throw new Error('Missing required fields');

    const newPackage: Package = {
      ...pkg as Package,
      id: crypto.randomUUID(),
      operatorId: ctx.userId, // Enforce ownership
      slug: generateSlug(pkg.title) + '-' + Math.random().toString(36).substring(7), // Ensure unique
    };
    
    return MockDB.savePackage(newPackage);
  },

  listPackages: (): Package[] => {
    return MockDB.getPackages().filter(p => p.status === 'published'); // Public read: only published
  },

  getPackageBySlug: (slug: string): Package | undefined => {
    return MockDB.getPackages().find(p => p.slug === slug);
  },

  getPackagesByOperator: (operatorId: string): Package[] => {
    return MockDB.getPackages().filter(p => p.operatorId === operatorId);
  },

  getOperatorBySlug: (slug: string): OperatorProfile | undefined => {
    return MockDB.getOperators().find((operator) => operator.slug === slug);
  },

  updatePackage: (ctx: RequestContext, id: string, updates: Partial<Package>): Package => {
    const existing = MockDB.getPackages().find(p => p.id === id);
    if (!existing) throw new Error('Not found');
    
    // RBAC: Only owner can update
    if (ctx.role !== 'operator' || existing.operatorId !== ctx.userId) {
      throw new Error('Unauthorized');
    }

    const updated = { ...existing, ...updates, id, operatorId: existing.operatorId }; // Protect id/operatorId
    return MockDB.savePackage(updated);
  },

  deletePackage: (ctx: RequestContext, id: string): void => {
    const existing = MockDB.getPackages().find(p => p.id === id);
    if (!existing) return;

    // RBAC: Only owner can delete
    if (ctx.role !== 'operator' || existing.operatorId !== ctx.userId) {
      throw new Error('Unauthorized');
    }

    MockDB.deletePackage(id);
  }
};
