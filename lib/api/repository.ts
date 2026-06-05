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

const requireOperatorOwnerOrAdmin = (ctx: RequestContext, operatorId: string) => {
  if (ctx.role === 'admin') return;
  if (ctx.role === 'operator' && ctx.userId === operatorId) return;
  throw new Error('Unauthorized');
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

const requireComplaintAccess = (ctx: RequestContext, complaint: Complaint) => {
  if (ctx.role === 'admin') return;
  if (ctx.role === 'customer' && ctx.userId === complaint.customerId) return;
  if (ctx.role === 'operator' && ctx.userId === complaint.operatorId) return;
  throw new Error('Unauthorized');
};

const requireComplaintOperatorAccess = (ctx: RequestContext, complaint: Complaint) => {
  if (ctx.role === 'operator' && ctx.userId === complaint.operatorId) return;
  throw new Error('Unauthorized');
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
  throw new Error('Unauthorized');
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
    const all = MockDB.getBookingIntents().map(pruneExpiredEvidence);
    if (ctx.role === 'customer') return all.filter(b => b.customerId === ctx.userId);
    if (ctx.role === 'operator') return all.filter(b => b.operatorId === ctx.userId);
    return all;
  },

  getEvidenceBytes: (ctx: RequestContext, bookingIntentId: string): BookingPaymentEvidence | undefined => {
    const bookingIntent = MockDB.getBookingIntents().find((b) => b.id === bookingIntentId);
    if (!bookingIntent) throw new Error('Booking intent not found');
    requireBookingIntentEvidenceAccess(ctx, bookingIntent);

    const pruned = pruneExpiredEvidence(bookingIntent);
    if (pruned.id !== bookingIntent.id) {
      MockDB.saveBookingIntent(pruned);
    }

    const evidence = pruned.paymentEvidence;
    if (!evidence) return undefined;
    if (evidence.storageStatus !== 'bytes-stored') {
      throw new Error('Evidence bytes have been purged or were never stored');
    }

    return evidence;
  },

  flagEvidenceForRetention: (ctx: RequestContext, bookingIntentId: string): BookingIntent => {
    requireAdmin(ctx);
    const bookingIntent = MockDB.getBookingIntents().find((b) => b.id === bookingIntentId);
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
    MockDB.saveBookingIntent(updated);
    return updated;
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

  getPaymentDetails: (ctx: RequestContext, operatorId: string): PaymentDetails | undefined => {
    requireOperatorOwnerOrAdmin(ctx, operatorId);
    activateEligibleBankChangeRequests(operatorId);
    return getActivePaymentDetails(operatorId);
  },

  getOperatorAuditLog: (ctx: RequestContext, operatorId: string): AuditLogEntry[] => {
    requireOperatorOwnerOrAdmin(ctx, operatorId);
    return MockDB.getAuditLog()
      .filter((entry) => entry.operatorId === operatorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAuditLog: (ctx: RequestContext): AuditLogEntry[] => {
    requireAdmin(ctx);
    return MockDB.getAuditLog();
  },

  // Operators
  createOperator: (ctx: RequestContext, input: Partial<OperatorProfile>): OperatorProfile => {
    // Only authenticated users can create operators; typically a user creates their own operator profile
    if (!ctx.userId) throw new Error('Unauthorized');

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

    MockDB.saveOperator(operator);
    return operator;
  },

  updateOperator: (ctx: RequestContext, id: string, updates: Partial<OperatorProfile>): OperatorProfile => {
    requireOperatorOwnerOrAdmin(ctx, id);
    const existing = MockDB.getOperatorById(id);
    if (!existing) throw new Error('Operator not found');

    const operator: OperatorProfile = {
      ...existing,
      ...updates,
      id, // protect id
      updatedAt: new Date().toISOString(),
    };
    MockDB.saveOperator(operator);
    return operator;
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

  exportPackagesAsCsv: (ctx: RequestContext): string => {
    if (ctx.role !== 'operator') throw new Error('Unauthorized');
    const packages = MockDB.getPackages().filter(p => p.operatorId === ctx.userId);
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

  importPackagesFromCsv: (ctx: RequestContext, csvText: string): { saved: Package[]; errors: { row: number; reason: string }[] } => {
    if (ctx.role !== 'operator') throw new Error('Unauthorized');

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
        hotelMakkahStars: Number(getValue(cells, 'hotelMakkahStars')) as 3 | 4 | 5 || undefined,
        hotelMadinahStars: Number(getValue(cells, 'hotelMadinahStars')) as 3 | 4 | 5 || undefined,
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

      MockDB.savePackage(pkg);
      saved.push(pkg);
    }

    return { saved, errors };
  },

  getOperators: (ctx: RequestContext): OperatorProfile[] => {
    const all = MockDB.getOperators();
    if (ctx.role === 'operator') return all.filter((o) => o.id === ctx.userId);
    if (ctx.role === 'admin') return all;
    return [];
  },

  getOperatorById: (id: string): OperatorProfile | undefined => {
    return MockDB.getOperatorById(id);
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
  },

  // Complaints
  createComplaint: (
    ctx: RequestContext,
    input: {
      bookingIntentId: string;
      category: ComplaintCategory;
      severity: ComplaintSeverity;
      description: string;
    }
  ): Complaint => {
    if (ctx.role !== 'customer') throw new Error('Unauthorized');

    const bookingIntent = MockDB.getBookingIntents().find((b) => b.id === input.bookingIntentId);
    if (!bookingIntent) throw new Error('Booking intent not found');
    if (bookingIntent.customerId !== ctx.userId) throw new Error('Unauthorized');

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

    MockDB.saveComplaint(complaint);
    return complaint;
  },

  getComplaints: (ctx: RequestContext): Complaint[] => {
    const all = MockDB.getComplaints();
    if (ctx.role === 'customer') return all.filter((c) => c.customerId === ctx.userId);
    if (ctx.role === 'operator') return all.filter((c) => c.operatorId === ctx.userId);
    return all;
  },

  getComplaintById: (ctx: RequestContext, id: string): Complaint | undefined => {
    const complaint = MockDB.getComplaints().find((c) => c.id === id);
    if (!complaint) return undefined;
    requireComplaintAccess(ctx, complaint);
    return complaint;
  },

  updateComplaintStatus: (ctx: RequestContext, id: string, status: ComplaintStatus): Complaint => {
    const complaint = MockDB.getComplaints().find((c) => c.id === id);
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
      throw new Error('Unauthorized');
    }

    const updated: Complaint = {
      ...complaint,
      status,
      updatedAt: new Date().toISOString(),
    };
    MockDB.saveComplaint(updated);
    return updated;
  },

  updateComplaintOperatorResponse: (ctx: RequestContext, id: string, response: string): Complaint => {
    const complaint = MockDB.getComplaints().find((c) => c.id === id);
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
    MockDB.saveComplaint(updated);
    return updated;
  },

  updateComplaintAdminNotes: (
    ctx: RequestContext,
    id: string,
    notes: string,
    flagOperator?: boolean
  ): Complaint => {
    requireAdmin(ctx);
    const complaint = MockDB.getComplaints().find((c) => c.id === id);
    if (!complaint) throw new Error('Complaint not found');

    const updated: Complaint = {
      ...complaint,
      adminNotes: notes.trim() || undefined,
      adminFlaggedOperator: flagOperator ?? complaint.adminFlaggedOperator,
      updatedAt: new Date().toISOString(),
    };
    MockDB.saveComplaint(updated);
    return updated;
  },
};
