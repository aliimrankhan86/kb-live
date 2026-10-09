import { MockDB } from './mock-db';
import { hasDeparted, isPubliclyListed, londonToday } from '@/lib/listing';
import { sortByScore } from '@/lib/ranking';
import { departureCityOf, resolveDepartureLocation } from '@/lib/airports';
import {
  ANALYTICS_EVENT_TYPES,
  AnalyticsEvent,
  AnalyticsEventCounts,
  AnalyticsEventType,
  AnalyticsMetadata,
  AnalyticsTrendDay,
  AuditLogEntry,
  BankChangeRequest,
  BookingIntent,
  BookingOutcome,
  BookingOutcomeType,
  BookingPaymentEvidence,
  BookingPaymentEvidenceFile,
  Complaint,
  ComplaintCategory,
  ComplaintSeverity,
  ComplaintStatus,
  Enquiry,
  MarketingConsent,
  Offer,
  OperatorProfile,
  Package,
  PaymentDetails,
  PaymentDetailsInput,
  PaymentInstructions,
  PaymentPhoneConfirmation,
  QuoteRequest,
  ReconciliationRow,
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
  getAnalyticsEvents: () => Promise.resolve(MockDB.getAnalyticsEvents()),
  getComplaints: () => Promise.resolve(MockDB.getComplaints()),
  savePackage: (pkg: Package) => Promise.resolve(MockDB.savePackage(pkg)),
  saveOperator: (op: OperatorProfile) => Promise.resolve(MockDB.saveOperator(op)),
  saveRequest: (req: QuoteRequest) => Promise.resolve(MockDB.saveRequest(req)),
  saveOffer: (offer: Offer) => Promise.resolve(MockDB.saveOffer(offer)),
  saveBookingIntent: (bi: BookingIntent) => Promise.resolve(MockDB.saveBookingIntent(bi)),
  savePaymentDetails: (pd: PaymentDetails) => Promise.resolve(MockDB.savePaymentDetails(pd)),
  saveBankChangeRequest: (bcr: BankChangeRequest) => Promise.resolve(MockDB.saveBankChangeRequest(bcr)),
  saveAuditLogEntry: (entry: AuditLogEntry) => Promise.resolve(MockDB.saveAuditLogEntry(entry)),
  saveAnalyticsEvent: (event: AnalyticsEvent) => Promise.resolve(MockDB.saveAnalyticsEvent(event)),
  saveComplaint: (c: Complaint) => Promise.resolve(MockDB.saveComplaint(c)),
  deletePackage: (id: string) => Promise.resolve(MockDB.deletePackage(id)),
  getEnquiries: () => Promise.resolve(MockDB.getEnquiries()),
  saveEnquiry: (enquiry: Enquiry) => Promise.resolve(MockDB.saveEnquiry(enquiry)),
  deleteUser: (id: string) => Promise.resolve(MockDB.deleteUser(id)),
  anonymiseEnquiriesByEmail: (email: string, erasedName: string) => Promise.resolve(MockDB.anonymiseEnquiriesByEmail(email, erasedName)),
  anonymiseEnquiriesCreatedBefore: (cutoff: Date, erasedName: string, alreadyErased: readonly string[]) =>
    Promise.resolve(MockDB.anonymiseEnquiriesCreatedBefore(cutoff, erasedName, alreadyErased)),
  deleteMarketingConsentsByEmail: (email: string) => Promise.resolve(MockDB.deleteMarketingConsentsByEmail(email)),
  deleteInterestsByEmail: (email: string) => Promise.resolve(MockDB.deleteInterestsByEmail(email)),
  getInterestsByEmail: async (email: string) =>
    MockDB.getInterests().filter((i) => i.email.toLowerCase() === email.trim().toLowerCase()),
  getMarketingConsents: () => Promise.resolve(MockDB.getMarketingConsents()),
  saveMarketingConsent: (consent: MarketingConsent) => Promise.resolve(MockDB.saveMarketingConsent(consent)),
  getBookingOutcomes: () => Promise.resolve(MockDB.getBookingOutcomes()),
  saveBookingOutcome: (bo: BookingOutcome) => Promise.resolve(MockDB.saveBookingOutcome(bo)),
  getDistinctDepartureCities: (): Promise<string[]> => {
    const citySet = new Set<string>();
    const verified = new Set(MockDB.getOperators().filter(isPubliclyListed).map((o) => o.id));
    for (const pkg of MockDB.getPackages()) {
      if (pkg.status !== 'published' || !pkg.departureAirport || !verified.has(pkg.operatorId) || hasDeparted(pkg)) continue;
      const city = departureCityOf(pkg.departureAirport);
      if (city) citySet.add(city);
    }
    return Promise.resolve([...citySet].sort());
  },
};

/**
 * Select the active data store.
 * - Client-side: always MockDB (Prisma is server-only)
 * - Production server (getDataSource() === 'prisma'): Prisma/Postgres via DBAdapter
 * - Tests & dev server (getDataSource() === 'mockdb'): MockDB
 *
 * Uses dynamic import() for server-only module loading. The production
 * webpack client build aliases this repo-local adapter to an empty module;
 * server builds keep the literal import so Next emits valid chunk paths.
 */
let prismaAdapter: typeof mockStore | null = null;

async function loadPrismaAdapter(): Promise<typeof mockStore> {
  if (prismaAdapter) return prismaAdapter;
  // This path only executes server-side when getDataSource() === 'prisma'.
  const mod = await import('./db/adapter');
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

const REFERENCE_CODE_PREFIX = 'PC';
const MAX_REFERENCE_CODE_ATTEMPTS = 10;
const BANK_CHANGE_COOLING_PERIOD_MS = 24 * 60 * 60 * 1000;
const PAY_OPERATOR_DIRECT_DISCLOSURE =
  'You pay the operator directly. PilgrimCompare does not collect, hold, or transfer customer funds. The operator is the contracting party and is responsible for package fulfilment, payment records, and any payment outcome.';
const ANALYTICS_PII_KEY_PATTERN = /(email|phone|name|address|customer|payer|payment|account)/i;

const isAcceptedEvidenceFile = (file: BookingPaymentEvidenceFile) =>
  (file.kind === 'image' && file.mimeType.startsWith('image/')) ||
  (file.kind === 'pdf' && file.mimeType === 'application/pdf');

const cleanOptionalText = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const emptyAnalyticsCounts = (): AnalyticsEventCounts =>
  ANALYTICS_EVENT_TYPES.reduce(
    (counts, eventType) => ({
      ...counts,
      [eventType]: 0,
    }),
    {} as AnalyticsEventCounts
  );

const sanitizeAnalyticsMetadata = (metadata?: AnalyticsMetadata): AnalyticsMetadata | undefined => {
  if (!metadata) return undefined;

  const sanitized = Object.entries(metadata).reduce<AnalyticsMetadata>((acc, [key, value]) => {
    if (ANALYTICS_PII_KEY_PATTERN.test(key)) return acc;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
};

const isWithinAnalyticsRange = (event: AnalyticsEvent, fromDate?: Date, toDate?: Date) => {
  const occurredAt = new Date(event.occurredAt).getTime();
  if (fromDate && occurredAt < fromDate.getTime()) return false;
  if (toDate && occurredAt > toDate.getTime()) return false;
  return true;
};

const getUtcDateKey = (date: Date) => date.toISOString().slice(0, 10);

const getAnalyticsTrendStart = (days: number) => {
  const safeDays = Math.max(1, Math.min(days, 365));
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - safeDays + 1);
  return start;
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
  const hasBytes = files.some((f) => typeof f.storagePath === 'string' && f.storagePath.length > 0);
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
        storagePath: undefined,
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

/**
 * RFC 4180 CSV: quoted fields may contain commas, "" escapes and line breaks
 * (cancellation policies and notes do), so parse the whole text, not lines.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, '').trim();
  for (let j = 0; j < src.length; j += 1) {
    const ch = src[j];
    if (inQuotes) {
      if (ch === '"' && src[j + 1] === '"') { cell += '"'; j += 1; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[j + 1] === '\n') j += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

async function verifiedOperatorIds(): Promise<Set<string>> {
  return new Set((await store().getOperators()).filter(isPubliclyListed).map((o) => o.id));
}

/** Shown when an account cannot be erased automatically. Never claims success. */
export const ACCOUNT_DELETE_MANUAL_MESSAGE =
  'We could not delete this account automatically because it is linked to listings, bookings or complaints. Nothing has been deleted. Email dpo@pilgrimcompare.co.uk and we will handle your request.';

/** Stands in for the name on an erased customer's enquiries (the column is required). */
export const ERASED_NAME = 'Deleted account';

/** Stands in for the name on an enquiry whose personal details were removed by retention. */
export const RETENTION_ERASED_NAME = 'Removed after 90 days';

/** Enquiry personal details (name, email, phone, message) are kept this long (privacy page, section 5). */
export const ENQUIRY_RETENTION_DAYS = 90;

/** Trust/verification state only an admin may change. */
const OPERATOR_PROTECTED_FIELDS = [
  'verificationStatus', 'verifiedAt', 'tier', 'eligibilityFlags', 'atolVerifiedAt', 'abtaVerifiedAt', 'slug',
] as const satisfies readonly (keyof OperatorProfile)[];

// ─── CSV import helpers (only stated values survive; nothing is defaulted) ──
const BANDS = ['near', 'medium', 'far', 'unknown'] as const;
const oneOf = <T extends string>(value: string, allowed: readonly T[]): T | undefined =>
  (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
/** 'true'/'false' (any case, or yes/no) → boolean; blank or anything else → not stated. */
const csvBool = (value: string): boolean | undefined => {
  const v = value.trim().toLowerCase();
  if (v === 'true' || v === 'yes') return true;
  if (v === 'false' || v === 'no') return false;
  return undefined;
};
const normaliseAirport = (value: string): string | undefined => {
  if (!value) return undefined;
  const loc = resolveDepartureLocation(value);
  return loc?.kind === 'airport' ? loc.codes[0] : value;
};

export const Repository = {
  // Analytics Events
  trackEvent: async (
    operatorId: string,
    eventType: AnalyticsEventType,
    packageId?: string,
    referenceId?: string,
    metadata?: AnalyticsMetadata
  ): Promise<AnalyticsEvent> => {
    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      operatorId,
      eventType,
      packageId,
      referenceId,
      metadata: sanitizeAnalyticsMetadata(metadata),
      occurredAt: new Date().toISOString(),
    };

    return store().saveAnalyticsEvent(event);
  },

  getAnalyticsSummary: async (
    operatorId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<AnalyticsEventCounts> => {
    const events = (await store().getAnalyticsEvents()).filter(
      (event) => event.operatorId === operatorId && isWithinAnalyticsRange(event, fromDate, toDate)
    );

    return events.reduce((counts, event) => {
      counts[event.eventType] += 1;
      return counts;
    }, emptyAnalyticsCounts());
  },

  getAnalyticsTrend: async (operatorId: string, days: number): Promise<AnalyticsTrendDay[]> => {
    const safeDays = Math.max(1, Math.min(days, 365));
    const start = getAnalyticsTrendStart(safeDays);
    const rows = new Map<string, AnalyticsTrendDay>();

    for (let i = 0; i < safeDays; i += 1) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + i);
      const key = getUtcDateKey(date);
      rows.set(key, { date: key, ...emptyAnalyticsCounts() });
    }

    const events = (await store().getAnalyticsEvents()).filter(
      (event) => event.operatorId === operatorId && new Date(event.occurredAt) >= start
    );

    for (const event of events) {
      const key = getUtcDateKey(new Date(event.occurredAt));
      const row = rows.get(key);
      if (row) row[event.eventType] += 1;
    }

    return Array.from(rows.values());
  },

  // Enquiries (canonical pilgrim enquiry — Task 2). Anonymous: no RequestContext.
  // Reuses the existing PC- reference-code generator (single source, no scatter).
  createEnquiry: async (input: {
    packageId: string;
    operatorId?: string;
    packageTitle?: string;
    operatorName?: string;
    name: string;
    email?: string;
    phone?: string;
    travelMonth?: string;
    message?: string;
  }): Promise<Enquiry> => {
    const existing = await store().getEnquiries();
    const existingCodes = new Set(
      existing.map((e) => e.referenceCode).filter((code): code is string => Boolean(code))
    );

    const enquiry: Enquiry = {
      id: crypto.randomUUID(),
      referenceCode: generateReferenceCode(existingCodes),
      createdAt: new Date().toISOString(),
      packageId: input.packageId,
      operatorId: input.operatorId,
      packageTitle: cleanOptionalText(input.packageTitle),
      operatorName: cleanOptionalText(input.operatorName),
      name: input.name.trim(),
      email: cleanOptionalText(input.email),
      phone: cleanOptionalText(input.phone),
      travelMonth: cleanOptionalText(input.travelMonth),
      message: cleanOptionalText(input.message),
    };

    return store().saveEnquiry(enquiry);
  },

  // Marketing consent (Task 3). Caller is responsible for the gating rule — a
  // record is created ONLY when the pilgrim opted in AND an email is present
  // (consent requires an email to be actionable). The enquiry reference is
  // always carried so the DB unique (email, enquiry_reference) dedupes.
  createMarketingConsent: async (input: {
    email: string;
    enquiryReference: string;
    source?: string;
  }): Promise<MarketingConsent> => {
    const consent: MarketingConsent = {
      id: crypto.randomUUID(),
      email: input.email.trim(),
      consent: true,
      consentTimestamp: new Date().toISOString(),
      source: input.source ?? 'enquiry_form',
      enquiryReference: input.enquiryReference,
      createdAt: new Date().toISOString(),
    };
    return store().saveMarketingConsent(consent);
  },

  // Quote Requests
  createQuoteRequest: async (ctx: RequestContext, request: QuoteRequest): Promise<QuoteRequest> => {
    if (ctx.role !== 'customer') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    const now = new Date().toISOString();
    const secureRequest: QuoteRequest = {
      ...request,
      id: request.id || crypto.randomUUID(),
      customerId: ctx.userId,
      status: 'open',
      createdAt: request.createdAt || now,
    };

    const saved = await store().saveRequest(secureRequest);
    const targetOperatorIds = new Set<string>();

    if (saved.sourceOperatorId) {
      targetOperatorIds.add(saved.sourceOperatorId);
    } else if (saved.sourcePackageId) {
      const pkg = (await store().getPackages()).find((candidate) => candidate.id === saved.sourcePackageId);
      if (pkg) targetOperatorIds.add(pkg.operatorId);
    } else {
      const operators = await store().getOperators();
      operators
        .filter((operator) => operator.verificationStatus === 'verified')
        .forEach((operator) => targetOperatorIds.add(operator.id));
    }

    for (const operatorId of targetOperatorIds) {
      try {
        await Repository.trackEvent(operatorId, 'quote_request', saved.sourcePackageId, saved.id, {
          type: saved.type,
          season: saved.season,
          source: saved.sourcePackageId ? 'package_detail' : 'quote_wizard',
        });
      } catch {
        // Analytics must not block quote submission.
      }
    }

    return saved;
  },

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

  getOffers: async (ctx: RequestContext): Promise<Offer[]> => {
    const all = await store().getOffers();
    if (ctx.role === 'operator') return all.filter((o) => o.operatorId === ctx.userId);
    if (ctx.role === 'admin') return all;
    return [];
  },

  createOffer: async (ctx: RequestContext, offer: Offer): Promise<Offer> => {
    if (ctx.role !== 'operator') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
    const secureOffer = { ...offer, operatorId: ctx.userId };
    const saved = await store().saveOffer(secureOffer);
    try {
      await Repository.trackEvent(ctx.userId, 'offer_sent', undefined, saved.id, {
        requestId: saved.requestId,
      });
    } catch {
      // Analytics must not block offer creation.
    }
    return saved;
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
    if (intent.id && existingIntents.some((booking) => booking.id === intent.id)) {
      throw new Error('Booking intent already exists');
    }
    const existingCodes = new Set(
      existingIntents
        .map((booking) => booking.referenceCode)
        .filter((referenceCode): referenceCode is string => Boolean(referenceCode))
    );
    const now = new Date().toISOString();

    const newIntent: BookingIntent = {
      id: intent.id ?? crypto.randomUUID(),
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
    try {
      await Repository.trackEvent(newIntent.operatorId, 'booking_started', undefined, newIntent.id, {
        offerId: newIntent.offerId,
      });
    } catch {
      // Analytics must not block booking intent creation.
    }
    return newIntent;
  },

  updateBookingIntentStatus: async (
    ctx: RequestContext,
    bookingIntentId: string,
    status: BookingIntent['status']
  ): Promise<BookingIntent> => {
    const bookingIntents = await store().getBookingIntents();
    const existing = bookingIntents.find((booking) => booking.id === bookingIntentId);
    if (!existing) throw new Error('Booking intent not found');

    if (ctx.role !== 'operator' || existing.operatorId !== ctx.userId) {
      throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
    }

    const updated: BookingIntent = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
    };

    await store().saveBookingIntent(updated);

    if (status === 'confirmed' || status === 'closed') {
      try {
        await Repository.trackEvent(
          updated.operatorId,
          status === 'confirmed' ? 'booking_confirmed' : 'booking_closed',
          undefined,
          updated.id,
          { offerId: updated.offerId }
        );
      } catch {
        // Analytics must not block booking status updates.
      }
    }

    return updated;
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

    // Operators may edit their own profile but never their trust state.
    const safe: Partial<OperatorProfile> = { ...updates };
    if (ctx.role !== 'admin') {
      for (const key of OPERATOR_PROTECTED_FIELDS) delete safe[key];
    }
    const operator: OperatorProfile = {
      ...existing,
      ...safe,
      id, // protect id
      updatedAt: new Date().toISOString(),
    };
    // A changed ATOL/ABTA number has not been checked yet: drop the old check
    // date so the page says "provided by the operator", not "checked". A new
    // ATOL number also takes the operator off the public listing until an
    // admin checks it (standards §7: we check each ATOL number before listing).
    if (ctx.role !== 'admin') {
      if ((operator.atolNumber ?? '').trim() !== (existing.atolNumber ?? '').trim()) {
        operator.atolVerifiedAt = undefined;
        if (existing.verificationStatus === 'verified') operator.verificationStatus = 'pending';
      }
      if (operator.abtaMemberNumber !== existing.abtaMemberNumber) operator.abtaVerifiedAt = undefined;
    }
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

  /**
   * Public package list. Founder decision (2026-10-06): only packages from
   * VERIFIED operators are ever shown publicly (Direction §2: verified only).
   * Departures that have passed are left out (lib/listing.ts hasDeparted).
   */
  listPackages: async (): Promise<Package[]> => {
    const [all, verified] = await Promise.all([store().getPackages(), verifiedOperatorIds()]);
    const today = londonToday();
    return sortByScore(all.filter((p) => p.status === 'published' && verified.has(p.operatorId) && !hasDeparted(p, today)));
  },

  /**
   * A package page target from a verified operator: published, or expired by
   * the cron, so the page can say the departure has passed. Else undefined.
   * Callers check hasDeparted before offering an enquiry.
   */
  getPublicPackageBySlug: async (slug: string): Promise<Package | undefined> => {
    const [all, verified] = await Promise.all([store().getPackages(), verifiedOperatorIds()]);
    return all.find((p) => p.slug === slug && (p.status === 'published' || p.status === 'expired') && verified.has(p.operatorId));
  },

  /** Enquiry API target: published, not departed, from a verified operator. */
  getPublicPackageById: async (id: string): Promise<Package | undefined> => {
    const [all, verified] = await Promise.all([store().getPackages(), verifiedOperatorIds()]);
    return all.find((p) => p.id === id && p.status === 'published' && verified.has(p.operatorId) && !hasDeparted(p));
  },

  /** Public operator profile: verified operators only. */
  getPublicOperatorBySlug: async (slug: string): Promise<OperatorProfile | undefined> =>
    (await store().getOperators()).find((o) => o.slug === slug && isPubliclyListed(o)),

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
      'ziyaratIncluded', 'ziyaratDetails',
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
      pkg.ziyaratIncluded ?? '', pkg.ziyaratDetails ?? '',
      pkg.inclusions.visa ?? '', pkg.inclusions.flights ?? '', pkg.inclusions.transfers ?? '', pkg.inclusions.meals ?? '',
      pkg.roomOccupancyOptions.single, pkg.roomOccupancyOptions.double,
      pkg.roomOccupancyOptions.triple, pkg.roomOccupancyOptions.quad,
      pkg.notes ?? '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');
  },

  importPackagesFromCsv: async (ctx: RequestContext, csvText: string): Promise<{ saved: Package[]; errors: { row: number; reason: string }[] }> => {
    if (ctx.role !== 'operator') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    const rows = parseCsv(csvText);
    if (rows.length < 2) throw new Error('CSV must contain a header row and at least one data row');

    const headers = rows[0].map((h) => h.trim());
    const requiredColumns = ['title', 'pricePerPerson', 'currency', 'totalNights', 'pilgrimageType'];
    const missing = requiredColumns.filter((c) => !headers.includes(c));
    if (missing.length > 0) throw new Error(`Missing required columns: ${missing.join(', ')}`);

    const getValue = (row: string[], col: string): string => {
      const idx = headers.indexOf(col);
      return idx >= 0 ? row[idx]?.trim() ?? '' : '';
    };

    const saved: Package[] = [];
    const errors: { row: number; reason: string }[] = [];

    for (let i = 1; i < rows.length; i += 1) {
      const cells = rows[i];
      if (cells.every((c) => c.trim() === '')) continue;

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
        // Only what the CSV states: no invented end date, nights split, payment
        // plan or enum values (data-integrity rule: missing = "Not provided").
        dateWindow: getValue(cells, 'dateWindowStart')
          ? { start: getValue(cells, 'dateWindowStart'), end: getValue(cells, 'dateWindowEnd') }
          : undefined,
        priceType: oneOf(getValue(cells, 'priceType'), ['exact', 'from', 'fixed'] as const) ?? 'exact',
        pricePerPerson,
        currency,
        totalNights,
        nightsMakkah: Number(getValue(cells, 'nightsMakkah')) || 0,
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
        distanceBandMakkah: oneOf(getValue(cells, 'distanceBandMakkah'), BANDS) ?? 'unknown',
        distanceBandMadinah: oneOf(getValue(cells, 'distanceBandMadinah'), BANDS) ?? 'unknown',
        airline: getValue(cells, 'airline') || undefined,
        // "Heathrow" / "LHR" → LHR; a city or unknown text is kept as written.
        departureAirport: normaliseAirport(getValue(cells, 'departureAirport')),
        flightType: oneOf(getValue(cells, 'flightType'), ['direct', 'one-stop', 'multi-stop'] as const),
        depositAmount: Number(getValue(cells, 'depositAmount')) || undefined,
        paymentPlanAvailable: csvBool(getValue(cells, 'paymentPlanAvailable')),
        cancellationPolicy: getValue(cells, 'cancellationPolicy') || undefined,
        groupType: oneOf(getValue(cells, 'groupType'), ['private', 'small-group', 'large-group'] as const),
        ziyaratIncluded: csvBool(getValue(cells, 'ziyaratIncluded')),
        ziyaratDetails: getValue(cells, 'ziyaratDetails') || undefined,
        roomOccupancyOptions: {
          single: getValue(cells, 'single') === 'true',
          double: getValue(cells, 'double') === 'true',
          triple: getValue(cells, 'triple') === 'true',
          quad: getValue(cells, 'quad') === 'true',
        },
        // Three-state: blank → not stated (null), never "not included".
        inclusions: {
          visa: csvBool(getValue(cells, 'visa')) ?? null,
          flights: csvBool(getValue(cells, 'flights')) ?? null,
          transfers: csvBool(getValue(cells, 'transfers')) ?? null,
          meals: csvBool(getValue(cells, 'meals')) ?? null,
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

  /** Server-only: fetch a single package by ID without auth filtering. */
  getPackageById: async (id: string): Promise<Package | undefined> => {
    const all = await store().getPackages();
    return all.find((p) => p.id === id);
  },

  /** Server-only: fetch a single booking intent by ID without auth filtering. */
  getBookingIntentById: async (id: string): Promise<BookingIntent | undefined> => {
    const all = await store().getBookingIntents();
    return all.find((b) => b.id === id);
  },

  getOperatorBySlug: async (slug: string): Promise<OperatorProfile | undefined> => {
    return (await store().getOperators()).find((operator) => operator.slug === slug);
  },

  /**
   * Erase the signed-in customer's own app record (UK GDPR Art. 17). Refuses,
   * with an honest reason, when the account cannot be erased automatically:
   * operator/admin accounts (tied to listings) and customers linked to quote,
   * booking or complaint records (booking outcomes are billing evidence and
   * are never deleted). The caller deletes the auth user afterwards.
   */
  assertCanDeleteOwnAccount: async (ctx: RequestContext): Promise<void> => {
    if (ctx.role !== 'customer') {
      throw new AppError({ code: 'CONFLICT', status: 409, message: ACCOUNT_DELETE_MANUAL_MESSAGE });
    }
    const [requests, intents, complaints] = await Promise.all([
      store().getRequests(),
      store().getBookingIntents(),
      store().getComplaints(),
    ]);
    const linked = [...requests, ...intents, ...complaints].some((r) => r.customerId === ctx.userId);
    if (linked) {
      throw new AppError({ code: 'CONFLICT', status: 409, message: ACCOUNT_DELETE_MANUAL_MESSAGE });
    }
  },

  /**
   * Erase everything PilgrimCompare holds for the signed-in customer except
   * the sign-in itself (the caller removes that last, so a failure here
   * leaves an account that can sign in and retry). Every step is idempotent.
   * Enquiries are kept for the operator's and our records with the personal
   * fields stripped; marketing consents and Hajj availability alerts
   * (`interests`) for the account email are deleted.
   */
  eraseOwnCustomerData: async (ctx: RequestContext, email: string): Promise<void> => {
    await Repository.assertCanDeleteOwnAccount(ctx);
    if (email) {
      await store().anonymiseEnquiriesByEmail(email, ERASED_NAME);
      await store().deleteMarketingConsentsByEmail(email);
      await store().deleteInterestsByEmail(email);
    }
    await store().deleteUser(ctx.userId);
  },

  /**
   * Access and portability (privacy page, section 6): the enquiries,
   * marketing choices and Hajj availability alerts held under the signed-in
   * account's email. A failed read throws, so an export never shows an empty
   * list for data that exists.
   */
  getOwnEmailData: async (email: string) => {
    const target = email.trim().toLowerCase();
    if (!target) return { enquiries: [], marketingConsents: [], interests: [] };
    const [enquiries, consents, interests] = await Promise.all([
      store().getEnquiries(),
      store().getMarketingConsents(),
      store().getInterestsByEmail(target),
    ]);
    return {
      enquiries: enquiries.filter((e) => e.email?.toLowerCase() === target),
      marketingConsents: consents.filter((c) => c.email.toLowerCase() === target),
      interests,
    };
  },

  /**
   * Retention (privacy page, section 5): remove the personal details from
   * enquiries older than ENQUIRY_RETENTION_DAYS, exactly the fields account
   * deletion removes. Reference code, operator, package, titles, travel month
   * and date stay for lead billing. Idempotent: returns how many rows changed.
   */
  anonymiseExpiredEnquiries: async (now: Date = new Date()): Promise<number> => {
    const cutoff = new Date(now.getTime() - ENQUIRY_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    return store().anonymiseEnquiriesCreatedBefore(cutoff, RETENTION_ERASED_NAME, [ERASED_NAME, RETENTION_ERASED_NAME]);
  },

  /**
   * Public (unauthenticated) operator list. Internal state (payment SLA flag,
   * onboarding progress) is admin-only and stripped. The two flags that decide
   * whether the (parked) "Proceed direct" button shows stay, because the
   * public UI reads them. Business contact fields are already public on the
   * operator profile page.
   */
  listPublicOperators: async (): Promise<OperatorProfile[]> => {
    return (await store().getOperators()).filter(isPubliclyListed).map(({ eligibilityFlags, ...publicFields }) => ({
      ...publicFields,
      ...(eligibilityFlags
        ? {
            eligibilityFlags: {
              canReceiveBookings: eligibilityFlags.canReceiveBookings,
              bankDetailsActive: eligibilityFlags.bankDetailsActive,
            } as OperatorProfile['eligibilityFlags'],
          }
        : {}),
    }));
  },

  getBankChangeRequests: async (ctx: RequestContext): Promise<BankChangeRequest[]> => {
    requireOperatorOwnerOrAdmin(ctx, ctx.userId);
    const all = await store().getBankChangeRequests();
    if (ctx.role === 'admin') return all;
    return all.filter((r) => r.operatorId === ctx.userId);
  },

  getBookingOutcomes: async (ctx: RequestContext): Promise<BookingOutcome[]> => {
    const all = await store().getBookingOutcomes();
    if (ctx.role === 'admin') return all;
    if (ctx.role === 'operator') {
      const bookings = await store().getBookingIntents();
      const ids = new Set(bookings.filter((b) => b.operatorId === ctx.userId).map((b) => b.id));
      return all.filter((o) => ids.has(o.bookingIntentId));
    }
    return [];
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

  createBookingOutcome: async (
    ctx: RequestContext,
    bookingIntentId: string,
    outcome: BookingOutcomeType,
    notes?: string
  ): Promise<BookingOutcome> => {
    if (ctx.role !== 'operator') throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    const allIntents = await store().getBookingIntents();
    const intent = allIntents.find((b) => b.id === bookingIntentId);
    if (!intent) throw new Error('Booking intent not found');
    if (intent.operatorId !== ctx.userId)
      throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
    if (intent.status !== 'confirmed' && intent.status !== 'closed')
      throw new Error('Outcome can only be reported for confirmed or closed bookings');

    const existing = (await store().getBookingOutcomes()).find((o) => o.bookingIntentId === bookingIntentId);
    if (existing) throw new Error('Outcome already reported for this booking');

    const newOutcome: BookingOutcome = {
      id: crypto.randomUUID(),
      bookingIntentId,
      outcome,
      reportedAt: new Date().toISOString(),
      notes: cleanOptionalText(notes),
    };
    await store().saveBookingOutcome(newOutcome);
    return newOutcome;
  },

  // Reconciliation
  getReconciliationData: async (
    ctx: RequestContext,
    fromDate: Date,
    toDate: Date
  ): Promise<ReconciliationRow[]> => {
    requireAdmin(ctx);

    const [intents, offers, operators, outcomes] = await Promise.all([
      store().getBookingIntents(),
      store().getOffers(),
      store().getOperators(),
      store().getBookingOutcomes(),
    ]);

    const operatorById = new Map(operators.map((o) => [o.id, o]));
    const offerById = new Map(offers.map((o) => [o.id, o]));
    const outcomeByIntentId = new Map(outcomes.map((o) => [o.bookingIntentId, o]));

    const fromMs = fromDate.getTime();
    const toMs = toDate.getTime();

    return intents
      .filter((intent) => {
        const createdMs = new Date(intent.createdAt).getTime();
        return createdMs >= fromMs && createdMs <= toMs;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((intent) => {
        const offer = offerById.get(intent.offerId);
        const operator = operatorById.get(intent.operatorId);
        const outcome = outcomeByIntentId.get(intent.id);
        const evidence = intent.paymentEvidence;
        return {
          referenceCode: intent.referenceCode ?? intent.id,
          status: intent.status,
          operatorName: operator?.companyName ?? intent.operatorId,
          paymentReference: evidence?.paymentReference,
          payerName: evidence?.payerName,
          evidenceStatus: evidence?.storageStatus,
          outcome: outcome?.outcome,
          outcomeReportedAt: outcome?.reportedAt,
          bookingCreatedAt: intent.createdAt,
          quoteRequestId: offer?.requestId,
        };
      });
  },

  getBookingOutcome: async (
    ctx: RequestContext,
    bookingIntentId: string
  ): Promise<BookingOutcome | undefined> => {
    const allIntents = await store().getBookingIntents();
    const intent = allIntents.find((b) => b.id === bookingIntentId);
    if (!intent) throw new Error('Booking intent not found');

    if (ctx.role === 'operator' && ctx.userId !== intent.operatorId)
      throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });
    if (ctx.role === 'customer' && ctx.userId !== intent.customerId)
      throw new AppError({ code: 'FORBIDDEN', status: 403, message: 'Unauthorized' });

    const outcomes = await store().getBookingOutcomes();
    return outcomes.find((o) => o.bookingIntentId === bookingIntentId);
  },

  getDistinctDepartureCities: (): Promise<string[]> =>
    store().getDistinctDepartureCities(),
};
