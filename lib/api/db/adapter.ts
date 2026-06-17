import { prisma } from './prisma';
import { UK_DEPARTURE_AIRPORTS } from '@/lib/airports';
import type {
  AnalyticsEvent,
  AuditLogEntry,
  BankChangeRequest,
  BookingIntent,
  Complaint,
  Enquiry,
  MarketingConsent,
  Offer,
  OperatorProfile,
  Package,
  PaymentDetails,
  QuoteRequest,
} from '@/lib/types';
import type { Decimal } from '@prisma/client/runtime/client';
import type {
  PackageModel as PrismaPackage,
  OperatorProfileModel as PrismaOperatorProfile,
  PaymentDetailsModel as PrismaPaymentDetails,
  BankChangeRequestModel as PrismaBankChangeRequest,
  AuditLogEntryModel as PrismaAuditLogEntry,
  QuoteRequestModel as PrismaQuoteRequest,
  OfferModel as PrismaOffer,
  BookingIntentModel as PrismaBookingIntent,
  AnalyticsEventModel as PrismaAnalyticsEvent,
  ComplaintModel as PrismaComplaint,
  EnquiryModel as PrismaEnquiry,
  MarketingConsentModel as PrismaMarketingConsent,
} from '@/lib/generated/prisma/models';

// ─── Helpers ─────────────────────────────────────────────────────────

const toISO = (d: Date | null | undefined): string | undefined =>
  d ? d.toISOString() : undefined;

const dToNum = (d: Decimal | null | undefined): number | undefined =>
  d ? Number(d) : undefined;

const dateOrNow = (d?: string | Date | null): Date =>
  d ? (d instanceof Date ? d : new Date(d)) : new Date();

// Prisma 7 strict JSON typing — cast JSON values through unknown
const pj = (v: unknown) => v as unknown as never;

// ─── Mappers: Prisma → App Types ─────────────────────────────────────

const mapOperatorProfile = (op: PrismaOperatorProfile): OperatorProfile => ({
  id: op.id,
  companyName: op.companyName,
  tradingName: op.tradingName ?? undefined,
  slug: op.slug ?? undefined,
  companyRegistrationNumber: op.companyRegistrationNumber ?? undefined,
  verificationStatus: op.verificationStatus as OperatorProfile['verificationStatus'],
  verifiedAt: toISO(op.verifiedAt),
  tier: op.tier as OperatorProfile['tier'],
  eligibilityFlags: {
    canReceiveBookings: op.canReceiveBookings,
    bankDetailsActive: op.bankDetailsActive,
    onboardingComplete: op.onboardingComplete,
    paymentSlaFlagged: op.paymentSlaFlagged ?? undefined,
  },
  atolNumber: op.atolNumber ?? undefined,
  abtaMemberNumber: op.abtaMemberNumber ?? undefined,
  contactEmail: op.contactEmail,
  contactPhone: op.contactPhone ?? undefined,
  officeAddress: (op.officeAddress as unknown as OperatorProfile['officeAddress']) ?? undefined,
  websiteUrl: op.websiteUrl ?? undefined,
  servingRegions: op.servingRegions,
  departureAirports: op.departureAirports,
  yearsInBusiness: op.yearsInBusiness ?? undefined,
  pilgrimageTypesOffered: op.pilgrimageTypesOffered as ('umrah' | 'hajj')[],
  createdAt: toISO(op.createdAt),
  updatedAt: toISO(op.updatedAt),
  branding: (op.branding as unknown as OperatorProfile['branding']) ?? undefined,
});

const mapPaymentDetails = (pd: PrismaPaymentDetails): PaymentDetails => ({
  id: pd.id,
  operatorId: pd.operatorId,
  accountHolderName: pd.accountHolderName,
  bankName: pd.bankName,
  sortCode: pd.sortCode,
  accountNumber: pd.accountNumber,
  currency: pd.currency,
  country: pd.country,
  status: pd.status as PaymentDetails['status'],
  createdAt: pd.createdAt.toISOString(),
  updatedAt: pd.updatedAt.toISOString(),
  activatedAt: toISO(pd.activatedAt),
  supersededAt: toISO(pd.supersededAt),
  createdByUserId: pd.createdByUserId,
  phoneVerifiedAt: pd.phoneVerifiedAt.toISOString(),
  phoneLastFour: pd.phoneLastFour,
});

const mapBankChangeRequest = (bcr: PrismaBankChangeRequest): BankChangeRequest => ({
  id: bcr.id,
  operatorId: bcr.operatorId,
  currentPaymentDetailsId: bcr.currentPaymentDetailsId ?? undefined,
  proposedDetails: bcr.proposedDetails as unknown as BankChangeRequest['proposedDetails'],
  status: bcr.status as BankChangeRequest['status'],
  requestedByUserId: bcr.requestedByUserId,
  requestedAt: bcr.requestedAt.toISOString(),
  reason: bcr.reason ?? undefined,
  reviewedByUserId: bcr.reviewedByUserId ?? undefined,
  reviewedAt: toISO(bcr.reviewedAt),
  reviewNotes: bcr.reviewNotes ?? undefined,
  activationEligibleAt: toISO(bcr.activationEligibleAt),
  activatedAt: toISO(bcr.activatedAt),
  cancelledByUserId: bcr.cancelledByUserId ?? undefined,
  cancelledAt: toISO(bcr.cancelledAt),
  phoneVerifiedAt: bcr.phoneVerifiedAt.toISOString(),
  phoneLastFour: bcr.phoneLastFour,
});

const mapAuditLogEntry = (ale: PrismaAuditLogEntry): AuditLogEntry => ({
  id: ale.id,
  action: (ale.action as string).replace(/_/g, '.') as AuditLogEntry['action'],
  actorUserId: ale.actorUserId,
  actorRole: ale.actorRole as AuditLogEntry['actorRole'],
  operatorId: ale.operatorId,
  targetType: ale.targetType as AuditLogEntry['targetType'],
  targetId: ale.targetId,
  createdAt: ale.createdAt.toISOString(),
  metadata: (ale.metadata as unknown as AuditLogEntry['metadata']) ?? undefined,
});

const mapQuoteRequest = (qr: PrismaQuoteRequest): QuoteRequest => ({
  id: qr.id,
  customerId: qr.customerId,
  status: qr.status as QuoteRequest['status'],
  createdAt: qr.createdAt.toISOString(),
  type: qr.type as QuoteRequest['type'],
  season: (qr.season as string).replace(/_/g, '-') as QuoteRequest['season'],
  dateWindow: (qr.dateWindow as QuoteRequest['dateWindow']) ?? undefined,
  departureCity: qr.departureCity ?? undefined,
  totalNights: qr.totalNights,
  nightsMakkah: qr.nightsMakkah,
  nightsMadinah: qr.nightsMadinah,
  hotelStars: qr.hotelStars as 3 | 4 | 5,
  distancePreference: qr.distancePreference as QuoteRequest['distancePreference'],
  budgetRange: (qr.budgetRange as QuoteRequest['budgetRange']) ?? undefined,
  occupancy: qr.occupancy as QuoteRequest['occupancy'],
  inclusions: qr.inclusions as QuoteRequest['inclusions'],
  notes: qr.notes ?? undefined,
  sourceOperatorId: qr.sourceOperatorId ?? undefined,
});

const mapEnquiry = (e: PrismaEnquiry): Enquiry => ({
  id: e.id,
  referenceCode: e.referenceCode,
  createdAt: e.createdAt.toISOString(),
  packageId: e.packageId,
  operatorId: e.operatorId ?? undefined,
  packageTitle: e.packageTitle ?? undefined,
  operatorName: e.operatorName ?? undefined,
  name: e.name,
  email: e.email ?? undefined,
  phone: e.phone ?? undefined,
  travelMonth: e.travelMonth ?? undefined,
  message: e.message ?? undefined,
});

const mapMarketingConsent = (c: PrismaMarketingConsent): MarketingConsent => ({
  id: c.id,
  email: c.email,
  consent: c.consent,
  consentTimestamp: c.consentTimestamp.toISOString(),
  source: c.source,
  enquiryReference: c.enquiryReference,
  createdAt: c.createdAt.toISOString(),
});

const mapOffer = (o: PrismaOffer): Offer => ({
  id: o.id,
  requestId: o.requestId,
  operatorId: o.operatorId,
  createdAt: o.createdAt.toISOString(),
  pricePerPerson: Number(o.pricePerPerson),
  currency: o.currency,
  totalNights: o.totalNights,
  nightsMakkah: o.nightsMakkah,
  nightsMadinah: o.nightsMadinah,
  hotelStars: o.hotelStars as 3 | 4 | 5,
  distanceToHaram: o.distanceToHaram,
  roomOccupancy: o.roomOccupancy as Offer['roomOccupancy'],
  inclusions: o.inclusions as Offer['inclusions'],
  notes: o.notes ?? undefined,
});

const mapBookingIntent = (bi: PrismaBookingIntent): BookingIntent => ({
  id: bi.id,
  referenceCode: bi.referenceCode ?? undefined,
  offerId: bi.offerId,
  customerId: bi.customerId,
  operatorId: bi.operatorId,
  status: bi.status as BookingIntent['status'],
  createdAt: bi.createdAt.toISOString(),
  updatedAt: bi.updatedAt.toISOString(),
  paymentEvidence: (bi.paymentEvidence as unknown as BookingIntent['paymentEvidence']) ?? undefined,
  skipProofAcknowledged: bi.skipProofAcknowledged ?? undefined,
  proofSkippedAt: toISO(bi.proofSkippedAt),
  notes: bi.notes ?? undefined,
});

const mapAnalyticsEvent = (event: PrismaAnalyticsEvent): AnalyticsEvent => ({
  id: event.id,
  operatorId: event.operatorId,
  eventType: event.eventType as AnalyticsEvent['eventType'],
  packageId: event.packageId ?? undefined,
  referenceId: event.referenceId ?? undefined,
  metadata: (event.metadata as unknown as AnalyticsEvent['metadata']) ?? undefined,
  occurredAt: event.occurredAt.toISOString(),
});

const mapPackage = (pkg: PrismaPackage): Package => ({
  id: pkg.id,
  operatorId: pkg.operatorId,
  title: pkg.title,
  slug: pkg.slug,
  status: pkg.status as Package['status'],
  pilgrimageType: pkg.pilgrimageType as Package['pilgrimageType'],
  seasonLabel: pkg.seasonLabel ?? undefined,
  dateWindow: (pkg.dateWindow as unknown as Package['dateWindow']) ?? undefined,
  priceType: pkg.priceType as Package['priceType'],
  pricePerPerson: Number(pkg.pricePerPerson),
  currency: pkg.currency,
  totalNights: pkg.totalNights,
  nightsMakkah: pkg.nightsMakkah,
  nightsMadinah: pkg.nightsMadinah,
  hotelMakkahStars: (pkg.hotelMakkahStars as 3 | 4 | 5) ?? undefined,
  hotelMadinahStars: (pkg.hotelMadinahStars as 3 | 4 | 5) ?? undefined,
  hotelMakkahName: pkg.hotelMakkahName ?? undefined,
  hotelMadinahName: pkg.hotelMadinahName ?? undefined,
  distanceToHaramMakkahMetres: pkg.distanceToHaramMakkahMetres ?? undefined,
  distanceToHaramMadinahMetres: pkg.distanceToHaramMadinahMetres ?? undefined,
  distanceBandMakkah: pkg.distanceBandMakkah as Package['distanceBandMakkah'],
  distanceBandMadinah: pkg.distanceBandMadinah as Package['distanceBandMadinah'],
  airline: pkg.airline ?? undefined,
  departureAirport: pkg.departureAirport ?? undefined,
  flightType: pkg.flightType as Package['flightType'] | undefined,
  depositAmount: dToNum(pkg.depositAmount),
  paymentPlanAvailable: pkg.paymentPlanAvailable ?? undefined,
  cancellationPolicy: pkg.cancellationPolicy ?? undefined,
  highlights: pkg.highlights,
  groupType: pkg.groupType as Package['groupType'] | undefined,
  ziyaratIncluded: pkg.ziyaratIncluded ?? undefined,
  ziyaratDetails: pkg.ziyaratDetails ?? undefined,
  createdAt: toISO(pkg.createdAt),
  updatedAt: toISO(pkg.updatedAt),
  roomOccupancyOptions: pkg.roomOccupancyOptions as unknown as Package['roomOccupancyOptions'],
  inclusions: pkg.inclusions as unknown as Package['inclusions'],
  notes: pkg.notes ?? undefined,
  images: pkg.images,
  isFeatured: pkg.isFeatured,
});

const mapComplaint = (c: PrismaComplaint): Complaint => ({
  id: c.id,
  bookingIntentId: c.bookingIntentId,
  referenceCode: c.referenceCode,
  customerId: c.customerId,
  operatorId: c.operatorId,
  category: c.category as Complaint['category'],
  severity: c.severity as Complaint['severity'],
  description: c.description,
  status: c.status as Complaint['status'],
  operatorResponse: c.operatorResponse ?? undefined,
  operatorRespondedAt: toISO(c.operatorRespondedAt),
  adminNotes: c.adminNotes ?? undefined,
  adminFlaggedOperator: c.adminFlaggedOperator ?? undefined,
  createdAt: c.createdAt.toISOString(),
  updatedAt: c.updatedAt.toISOString(),
});

// ─── DB Adapter (matches MockDB interface) ───────────────────────────

export const DBAdapter = {
  // Users
  getUsers: async () => prisma.user.findMany(),

  // Quote Requests
  getRequests: async (): Promise<QuoteRequest[]> =>
    (await prisma.quoteRequest.findMany()).map(mapQuoteRequest),

  saveRequest: async (req: QuoteRequest): Promise<QuoteRequest> => {
    const data = {
      id: req.id,
      customerId: req.customerId,
      status: req.status,
      type: req.type,
      season: req.season.replace(/-/g, '_') as PrismaQuoteRequest['season'],
      dateWindow: pj(req.dateWindow),
      departureCity: req.departureCity ?? null,
      totalNights: req.totalNights,
      nightsMakkah: req.nightsMakkah,
      nightsMadinah: req.nightsMadinah,
      hotelStars: req.hotelStars,
      distancePreference: req.distancePreference,
      budgetRange: pj(req.budgetRange),
      occupancy: pj(req.occupancy),
      inclusions: pj(req.inclusions),
      notes: req.notes ?? null,
      sourceOperatorId: req.sourceOperatorId ?? null,
    };
    const saved = await prisma.quoteRequest.upsert({
      where: { id: req.id },
      create: data,
      update: data,
    });
    return mapQuoteRequest(saved);
  },

  getRequestById: async (id: string): Promise<QuoteRequest | undefined> => {
    const found = await prisma.quoteRequest.findUnique({ where: { id } });
    return found ? mapQuoteRequest(found) : undefined;
  },

  // Offers
  getOffers: async (): Promise<Offer[]> =>
    (await prisma.offer.findMany()).map(mapOffer),

  saveOffer: async (offer: Offer): Promise<Offer> => {
    const data = {
      id: offer.id,
      requestId: offer.requestId,
      operatorId: offer.operatorId,
      pricePerPerson: offer.pricePerPerson,
      currency: offer.currency,
      totalNights: offer.totalNights,
      nightsMakkah: offer.nightsMakkah,
      nightsMadinah: offer.nightsMadinah,
      hotelStars: offer.hotelStars,
      distanceToHaram: offer.distanceToHaram,
      roomOccupancy: pj(offer.roomOccupancy),
      inclusions: pj(offer.inclusions),
      notes: offer.notes ?? null,
    };
    const saved = await prisma.offer.upsert({
      where: { id: offer.id },
      create: data,
      update: data,
    });
    // Auto-update request status to responded
    const req = await prisma.quoteRequest.findUnique({ where: { id: offer.requestId } });
    if (req && req.status === 'open') {
      await prisma.quoteRequest.update({ where: { id: req.id }, data: { status: 'responded' } });
    }
    return mapOffer(saved);
  },

  getOffersByRequestId: async (requestId: string): Promise<Offer[]> =>
    (await prisma.offer.findMany({ where: { requestId } })).map(mapOffer),

  // Booking Intents
  getBookingIntents: async (): Promise<BookingIntent[]> =>
    (await prisma.bookingIntent.findMany()).map(mapBookingIntent),

  saveBookingIntent: async (booking: BookingIntent): Promise<BookingIntent> => {
    const data = {
      id: booking.id,
      referenceCode: booking.referenceCode ?? null,
      offerId: booking.offerId,
      customerId: booking.customerId,
      operatorId: booking.operatorId,
      status: booking.status,
      paymentEvidence: pj(booking.paymentEvidence),
      skipProofAcknowledged: booking.skipProofAcknowledged ?? null,
      proofSkippedAt: booking.proofSkippedAt ? dateOrNow(booking.proofSkippedAt) : null,
      notes: booking.notes ?? null,
    };
    const saved = await prisma.bookingIntent.upsert({
      where: { id: booking.id },
      create: { ...data, createdAt: dateOrNow(booking.createdAt), updatedAt: dateOrNow(booking.updatedAt) },
      update: { ...data, updatedAt: dateOrNow(booking.updatedAt) },
    });
    return mapBookingIntent(saved);
  },

  // Packages
  getPackages: async (): Promise<Package[]> =>
    (await prisma.package.findMany()).map(mapPackage),

  getDistinctDepartureCities: async (): Promise<string[]> => {
    const rows = await prisma.package.findMany({
      where: { status: 'published', departureAirport: { not: null } },
      select: { departureAirport: true },
    });
    const citySet = new Set<string>();
    for (const row of rows) {
      if (!row.departureAirport) continue;
      const airport = UK_DEPARTURE_AIRPORTS.find((a) => a.code === row.departureAirport);
      if (airport) citySet.add(airport.city);
    }
    return [...citySet].sort();
  },

  savePackage: async (pkg: Package): Promise<Package> => {
    const data = {
      id: pkg.id,
      operatorId: pkg.operatorId,
      title: pkg.title,
      slug: pkg.slug,
      status: pkg.status,
      pilgrimageType: pkg.pilgrimageType,
      seasonLabel: pkg.seasonLabel ?? null,
      dateWindow: pj(pkg.dateWindow),
      priceType: pkg.priceType,
      pricePerPerson: pkg.pricePerPerson,
      currency: pkg.currency,
      totalNights: pkg.totalNights,
      nightsMakkah: pkg.nightsMakkah,
      nightsMadinah: pkg.nightsMadinah,
      hotelMakkahStars: pkg.hotelMakkahStars ?? null,
      hotelMadinahStars: pkg.hotelMadinahStars ?? null,
      hotelMakkahName: pkg.hotelMakkahName ?? null,
      hotelMadinahName: pkg.hotelMadinahName ?? null,
      distanceToHaramMakkahMetres: pkg.distanceToHaramMakkahMetres ?? null,
      distanceToHaramMadinahMetres: pkg.distanceToHaramMadinahMetres ?? null,
      distanceBandMakkah: pkg.distanceBandMakkah,
      distanceBandMadinah: pkg.distanceBandMadinah,
      airline: pkg.airline ?? null,
      departureAirport: pkg.departureAirport ?? null,
      flightType: pkg.flightType ?? null,
      depositAmount: pkg.depositAmount ?? null,
      paymentPlanAvailable: pkg.paymentPlanAvailable ?? null,
      cancellationPolicy: pkg.cancellationPolicy ?? null,
      highlights: pkg.highlights ?? [],
      groupType: pkg.groupType ?? null,
      ziyaratIncluded: pkg.ziyaratIncluded ?? null,
      ziyaratDetails: pkg.ziyaratDetails ?? null,
      roomOccupancyOptions: pj(pkg.roomOccupancyOptions),
      inclusions: pj(pkg.inclusions),
      notes: pkg.notes ?? null,
      images: pkg.images ?? [],
    };
    const saved = await prisma.package.upsert({
      where: { id: pkg.id },
      create: data,
      update: data,
    });
    return mapPackage(saved);
  },

  deletePackage: async (id: string): Promise<void> => {
    await prisma.package.delete({ where: { id } });
  },

  // Operators
  getOperators: async (): Promise<OperatorProfile[]> =>
    (await prisma.operatorProfile.findMany()).map(mapOperatorProfile),

  getOperatorById: async (id: string): Promise<OperatorProfile | undefined> => {
    const found = await prisma.operatorProfile.findUnique({ where: { id } });
    return found ? mapOperatorProfile(found) : undefined;
  },

  saveOperator: async (operator: OperatorProfile): Promise<OperatorProfile> => {
    const data = {
      id: operator.id,
      companyName: operator.companyName,
      tradingName: operator.tradingName ?? null,
      slug: operator.slug ?? null,
      companyRegistrationNumber: operator.companyRegistrationNumber ?? null,
      verificationStatus: operator.verificationStatus,
      verifiedAt: operator.verifiedAt ? dateOrNow(operator.verifiedAt) : null,
      tier: operator.tier ?? 'listed',
      atolNumber: operator.atolNumber ?? null,
      abtaMemberNumber: operator.abtaMemberNumber ?? null,
      contactEmail: operator.contactEmail,
      contactPhone: operator.contactPhone ?? null,
      officeAddress: pj(operator.officeAddress),
      websiteUrl: operator.websiteUrl ?? null,
      servingRegions: operator.servingRegions ?? [],
      departureAirports: operator.departureAirports ?? [],
      yearsInBusiness: operator.yearsInBusiness ?? null,
      pilgrimageTypesOffered: operator.pilgrimageTypesOffered ?? [],
      branding: pj(operator.branding),
      canReceiveBookings: operator.eligibilityFlags?.canReceiveBookings ?? false,
      bankDetailsActive: operator.eligibilityFlags?.bankDetailsActive ?? false,
      onboardingComplete: operator.eligibilityFlags?.onboardingComplete ?? false,
      paymentSlaFlagged: operator.eligibilityFlags?.paymentSlaFlagged ?? false,
    };
    const saved = await prisma.operatorProfile.upsert({
      where: { id: operator.id },
      create: data,
      update: data,
    });
    return mapOperatorProfile(saved);
  },

  // Payment Details
  getPaymentDetails: async (): Promise<PaymentDetails[]> =>
    (await prisma.paymentDetails.findMany()).map(mapPaymentDetails),

  savePaymentDetails: async (pd: PaymentDetails): Promise<PaymentDetails> => {
    const data = {
      id: pd.id,
      operatorId: pd.operatorId,
      accountHolderName: pd.accountHolderName,
      bankName: pd.bankName,
      sortCode: pd.sortCode,
      accountNumber: pd.accountNumber,
      currency: pd.currency,
      country: pd.country,
      status: pd.status,
      activatedAt: pd.activatedAt ? dateOrNow(pd.activatedAt) : null,
      supersededAt: pd.supersededAt ? dateOrNow(pd.supersededAt) : null,
      createdByUserId: pd.createdByUserId,
      phoneVerifiedAt: dateOrNow(pd.phoneVerifiedAt),
      phoneLastFour: pd.phoneLastFour,
    };
    const saved = await prisma.paymentDetails.upsert({
      where: { id: pd.id },
      create: { ...data, createdAt: dateOrNow(pd.createdAt), updatedAt: dateOrNow(pd.updatedAt) },
      update: { ...data, updatedAt: dateOrNow(pd.updatedAt) },
    });
    return mapPaymentDetails(saved);
  },

  // Bank Change Requests
  getBankChangeRequests: async (): Promise<BankChangeRequest[]> =>
    (await prisma.bankChangeRequest.findMany()).map(mapBankChangeRequest),

  saveBankChangeRequest: async (request: BankChangeRequest): Promise<BankChangeRequest> => {
    const data = {
      id: request.id,
      operatorId: request.operatorId,
      currentPaymentDetailsId: request.currentPaymentDetailsId ?? null,
      proposedDetails: pj(request.proposedDetails),
      status: request.status,
      requestedByUserId: request.requestedByUserId,
      reason: request.reason ?? null,
      reviewedByUserId: request.reviewedByUserId ?? null,
      reviewedAt: request.reviewedAt ? dateOrNow(request.reviewedAt) : null,
      reviewNotes: request.reviewNotes ?? null,
      activationEligibleAt: request.activationEligibleAt ? dateOrNow(request.activationEligibleAt) : null,
      activatedAt: request.activatedAt ? dateOrNow(request.activatedAt) : null,
      cancelledByUserId: request.cancelledByUserId ?? null,
      cancelledAt: request.cancelledAt ? dateOrNow(request.cancelledAt) : null,
      phoneVerifiedAt: dateOrNow(request.phoneVerifiedAt),
      phoneLastFour: request.phoneLastFour,
    };
    const saved = await prisma.bankChangeRequest.upsert({
      where: { id: request.id },
      create: { ...data, requestedAt: dateOrNow(request.requestedAt) },
      update: data,
    });
    return mapBankChangeRequest(saved);
  },

  // Audit Log
  getAuditLog: async (): Promise<AuditLogEntry[]> =>
    (await prisma.auditLogEntry.findMany()).map(mapAuditLogEntry),

  saveAuditLogEntry: async (entry: AuditLogEntry): Promise<AuditLogEntry> => {
    const saved = await prisma.auditLogEntry.create({
      data: {
        id: entry.id,
        action: entry.action.replace(/\./g, '_') as PrismaAuditLogEntry['action'],
        actorUserId: entry.actorUserId,
        actorRole: entry.actorRole,
        operatorId: entry.operatorId,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: pj(entry.metadata),
        createdAt: dateOrNow(entry.createdAt),
      },
    });
    return mapAuditLogEntry(saved);
  },

  // Analytics Events
  getAnalyticsEvents: async (): Promise<AnalyticsEvent[]> =>
    (await prisma.analyticsEvent.findMany()).map(mapAnalyticsEvent),

  saveAnalyticsEvent: async (event: AnalyticsEvent): Promise<AnalyticsEvent> => {
    const saved = await prisma.analyticsEvent.create({
      data: {
        id: event.id,
        operatorId: event.operatorId,
        eventType: event.eventType,
        packageId: event.packageId ?? null,
        referenceId: event.referenceId ?? null,
        metadata: pj(event.metadata),
        occurredAt: dateOrNow(event.occurredAt),
      },
    });
    return mapAnalyticsEvent(saved);
  },

  // Complaints
  getComplaints: async (): Promise<Complaint[]> =>
    (await prisma.complaint.findMany()).map(mapComplaint),

  saveComplaint: async (complaint: Complaint): Promise<Complaint> => {
    const data = {
      id: complaint.id,
      bookingIntentId: complaint.bookingIntentId,
      referenceCode: complaint.referenceCode,
      customerId: complaint.customerId,
      operatorId: complaint.operatorId,
      category: complaint.category,
      severity: complaint.severity,
      description: complaint.description,
      status: complaint.status,
      operatorResponse: complaint.operatorResponse ?? null,
      operatorRespondedAt: complaint.operatorRespondedAt ? dateOrNow(complaint.operatorRespondedAt) : null,
      adminNotes: complaint.adminNotes ?? null,
      adminFlaggedOperator: complaint.adminFlaggedOperator ?? null,
    };
    const saved = await prisma.complaint.upsert({
      where: { id: complaint.id },
      create: { ...data, createdAt: dateOrNow(complaint.createdAt), updatedAt: dateOrNow(complaint.updatedAt) },
      update: { ...data, updatedAt: dateOrNow(complaint.updatedAt) },
    });
    return mapComplaint(saved);
  },

  // Enquiries (canonical pilgrim enquiry — Task 2)
  getEnquiries: async (): Promise<Enquiry[]> =>
    (await prisma.enquiry.findMany()).map(mapEnquiry),

  saveEnquiry: async (enquiry: Enquiry): Promise<Enquiry> => {
    const data = {
      id: enquiry.id,
      referenceCode: enquiry.referenceCode,
      packageId: enquiry.packageId,
      operatorId: enquiry.operatorId ?? null,
      packageTitle: enquiry.packageTitle ?? null,
      operatorName: enquiry.operatorName ?? null,
      name: enquiry.name,
      email: enquiry.email ?? null,
      phone: enquiry.phone ?? null,
      travelMonth: enquiry.travelMonth ?? null,
      message: enquiry.message ?? null,
    };
    const saved = await prisma.enquiry.upsert({
      where: { id: enquiry.id },
      create: { ...data, createdAt: dateOrNow(enquiry.createdAt) },
      update: data,
    });
    return mapEnquiry(saved);
  },

  // Marketing consents (Task 3). Idempotent on (email, enquiryReference).
  getMarketingConsents: async (): Promise<MarketingConsent[]> =>
    (await prisma.marketingConsent.findMany()).map(mapMarketingConsent),

  saveMarketingConsent: async (consent: MarketingConsent): Promise<MarketingConsent> => {
    const data = {
      email: consent.email,
      consent: consent.consent,
      consentTimestamp: dateOrNow(consent.consentTimestamp),
      source: consent.source,
      enquiryReference: consent.enquiryReference,
    };
    const saved = await prisma.marketingConsent.upsert({
      where: {
        email_enquiryReference: { email: consent.email, enquiryReference: consent.enquiryReference },
      },
      create: { id: consent.id, ...data, createdAt: dateOrNow(consent.createdAt) },
      update: data,
    });
    return mapMarketingConsent(saved);
  },

  // Transaction support
  $transaction: async <T>(
    fn: (tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$use' | '$extends'>) => Promise<T>
  ): Promise<T> => prisma.$transaction((tx) => fn(tx)),
};
