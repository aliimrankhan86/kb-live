export type UserRole = 'customer' | 'operator' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  marketingConsent?: boolean;
  marketingConsentAt?: string;
  marketingConsentSource?: string;
  cookieConsent?: {
    essential: boolean;
    analytics: boolean;
    timestamp: string;
  };
}

export const ANALYTICS_EVENT_TYPES = [
  'package_view',
  'quote_request',
  'offer_sent',
  'booking_started',
  'booking_confirmed',
  'booking_closed',
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export type AnalyticsMetadata = Record<string, string | number | boolean | null>;

export interface AnalyticsEvent {
  id: string;
  operatorId: string;
  eventType: AnalyticsEventType;
  packageId?: string;
  referenceId?: string;
  metadata?: AnalyticsMetadata;
  occurredAt: string;
}

export type AnalyticsEventCounts = Record<AnalyticsEventType, number>;

export type AnalyticsTrendDay = { date: string } & AnalyticsEventCounts;

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type OperatorTier = 'listed' | 'verified' | 'verified_plus';

export interface OperatorEligibilityFlags {
  canReceiveBookings: boolean;
  bankDetailsActive: boolean;
  onboardingComplete: boolean;
  paymentSlaFlagged?: boolean;
}

export interface OperatorProfile {
  id: string; // linked to User.id
  companyName: string;
  tradingName?: string;
  slug?: string; // url-friendly
  companyRegistrationNumber?: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  tier?: OperatorTier;
  eligibilityFlags?: OperatorEligibilityFlags;
  atolNumber?: string;
  atolVerifiedAt?: string;
  abtaMemberNumber?: string;
  abtaVerifiedAt?: string;
  contactEmail: string;
  contactPhone?: string;
  officeAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  websiteUrl?: string;
  servingRegions?: string[];
  departureAirports?: string[];
  yearsInBusiness?: number;
  pilgrimageTypesOffered?: ('umrah' | 'hajj')[];
  createdAt?: string;
  updatedAt?: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
  };
}

export type PaymentDetailsStatus = 'active' | 'superseded' | 'disabled';

export interface PaymentDetailsInput {
  accountHolderName: string;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  currency: string;
  country: string;
}

export interface PaymentPhoneConfirmation {
  confirmed: boolean;
  phoneLastFour: string;
}

export interface PaymentDetails extends PaymentDetailsInput {
  id: string;
  operatorId: string;
  status: PaymentDetailsStatus;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  supersededAt?: string;
  createdByUserId: string;
  phoneVerifiedAt: string;
  phoneLastFour: string;
}

export type BankChangeRequestStatus = 'pending_review' | 'approved' | 'rejected' | 'cancelled' | 'activated';

export interface BankChangeRequest {
  id: string;
  operatorId: string;
  currentPaymentDetailsId?: string;
  proposedDetails: PaymentDetailsInput;
  status: BankChangeRequestStatus;
  requestedByUserId: string;
  requestedAt: string;
  reason?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  activationEligibleAt?: string;
  activatedAt?: string;
  cancelledByUserId?: string;
  cancelledAt?: string;
  phoneVerifiedAt: string;
  phoneLastFour: string;
}

export type AuditLogAction =
  | 'payment_details.created'
  | 'bank_change.requested'
  | 'bank_change.approved'
  | 'bank_change.rejected'
  | 'bank_change.cancelled'
  | 'bank_change.activated';

export interface AuditLogEntry {
  id: string;
  action: AuditLogAction;
  actorUserId: string;
  actorRole: UserRole;
  operatorId: string;
  targetType: 'payment_details' | 'bank_change_request';
  targetId: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface PaymentInstructions {
  bookingIntentId: string;
  operatorId: string;
  operatorName: string;
  paymentDetailsId: string;
  accountHolderName: string;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  currency: string;
  country: string;
  disclosure: string;
  delivery: 'in_app_only';
}

export type Season = 'ramadan' | 'hajj' | 'school-holidays' | 'flexible' | 'custom';

export interface QuoteRequest {
  id: string;
  customerId: string; // User.id (or guest ID if allowed)
  status: 'open' | 'responded' | 'closed';
  createdAt: string; // ISO date
  sourcePackageId?: string;
  sourceOperatorId?: string;
  
  // Preferences
  type: 'umrah' | 'hajj';
  season: Season;
  dateWindow?: {
    start?: string; // ISO date
    end?: string; // ISO date
    flexible: boolean;
  };
  
  // Location & Stay
  departureCity?: string;
  departureArea?: string;
  departureAirport?: string;
  totalNights: number;
  nightsMakkah: number;
  nightsMadinah: number;
  
  // Hotel & Budget
  hotelStars: 3 | 4 | 5;
  distancePreference: 'near' | 'medium' | 'far' | 'range';
  budgetRange?: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Room
  occupancy: {
    single: number;
    double: number;
    triple: number;
    quad: number;
  };
  
  // Inclusions
  inclusions: {
    visa: boolean;
    flights: boolean;
    transfers: boolean;
    meals: boolean;
  };
  
  notes?: string;
}

export type BookingStatus = 'started' | 'contacted' | 'confirmed' | 'closed';

export type BookingOutcomeType =
  | 'travelled'
  | 'cancelled_operator'
  | 'cancelled_customer'
  | 'no_show'
  | 'disputed';

export interface BookingOutcome {
  id: string;
  bookingIntentId: string;
  outcome: BookingOutcomeType;
  reportedAt: string;
  notes?: string;
}

export type BookingPaymentEvidenceFileKind = 'image' | 'pdf';

export interface BookingPaymentEvidenceFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  kind: BookingPaymentEvidenceFileKind;
  lastModified?: number;
  uploadedAt: string;
  /** Object path within the private `payment-evidence` Supabase Storage bucket. */
  storagePath?: string;
}

export type EvidenceStorageStatus = 'metadata-only' | 'bytes-stored';

export interface BookingPaymentEvidence {
  files: BookingPaymentEvidenceFile[];
  payerName?: string;
  paymentReference?: string;
  notes?: string;
  submittedAt: string;
  storageStatus: EvidenceStorageStatus;
  disputeFlag?: boolean;
  retentionExpiresAt?: string;
}

/** One booking row for the admin reconciliation export. Flattened across booking, evidence, and outcome. */
export interface ReconciliationRow {
  referenceCode: string;
  status: BookingStatus;
  operatorName: string;
  paymentReference?: string;
  payerName?: string;
  evidenceStatus?: EvidenceStorageStatus;
  outcome?: BookingOutcomeType;
  outcomeReportedAt?: string;
  bookingCreatedAt: string;
  quoteRequestId?: string;
}

export interface BookingIntent {
  id: string;
  referenceCode?: string; // Required for new records; legacy MockDB records are normalised on read.
  offerId: string;
  customerId: string;
  operatorId: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  paymentEvidence?: BookingPaymentEvidence;
  skipProofAcknowledged?: boolean; // Required when proof is skipped.
  proofSkippedAt?: string;
  notes?: string;
}

export interface Offer {
  id: string;
  requestId: string;
  operatorId: string;
  createdAt: string;
  
  // Structured Response (Comparison Fields)
  pricePerPerson: number;
  currency: string;
  
  totalNights: number;
  nightsMakkah: number;
  nightsMadinah: number;
  
  hotelStars: 3 | 4 | 5;
  distanceToHaram: string; // e.g., "500m" or "Shuttle" or "Unknown"
  
  roomOccupancy: {
    single?: boolean;
    double?: boolean;
    triple?: boolean;
    quad?: boolean;
  };
  
  inclusions: {
    visa: boolean;
    flights: boolean;
    transfers: boolean;
    meals: boolean;
  };
  
  notes?: string; // Free text for details
}

// Package listing (Catalogue) - upgrade path
export interface Package {
  id: string;
  operatorId: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  
  pilgrimageType: 'umrah' | 'hajj';
  seasonLabel?: string;
  dateWindow?: {
    start: string;
    end: string;
  };
  
  priceType: 'exact' | 'from' | 'fixed';
  pricePerPerson: number;
  currency: string;
  
  totalNights: number;
  nightsMakkah: number;
  nightsMadinah: number;
  
  hotelMakkahStars?: 3 | 4 | 5;
  hotelMadinahStars?: 3 | 4 | 5;
  hotelMakkahName?: string;
  hotelMadinahName?: string;
  distanceToHaramMakkahMetres?: number;
  distanceToHaramMadinahMetres?: number;
  
  distanceBandMakkah: 'near' | 'medium' | 'far' | 'unknown';
  distanceBandMadinah: 'near' | 'medium' | 'far' | 'unknown';
  airline?: string;
  departureAirport?: string;
  flightType?: 'direct' | 'one-stop' | 'multi-stop';
  depositAmount?: number;
  paymentPlanAvailable?: boolean;
  cancellationPolicy?: string;
  highlights?: string[];
  groupType?: 'private' | 'small-group' | 'large-group';
  createdAt?: string;
  updatedAt?: string;
  
  roomOccupancyOptions: {
    single: boolean;
    double: boolean;
    triple: boolean;
    quad: boolean;
  };
  
  inclusions: {
    visa: boolean;
    flights: boolean;
    transfers: boolean;
    meals: boolean;
  };
  
  notes?: string; // sanitized, no HTML
  images?: string[];
  imageUrl?: string;
}

export type ComplaintCategory =
  | 'payment_issue'
  | 'service_quality'
  | 'package_description'
  | 'booking_problem'
  | 'other';

export type ComplaintSeverity = 'low' | 'medium' | 'high';

export type ComplaintStatus =
  | 'submitted'
  | 'operator_notified'
  | 'operator_responding'
  | 'admin_triage'
  | 'resolved'
  | 'closed'
  | 'cannot_resolve';

export interface Complaint {
  id: string;
  bookingIntentId: string;
  referenceCode: string;
  customerId: string;
  operatorId: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  description: string;
  status: ComplaintStatus;
  operatorResponse?: string;
  operatorRespondedAt?: string;
  adminNotes?: string;
  adminFlaggedOperator?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Unified shape for comparison
export interface ComparisonItem {
  id: string;
  type: 'offer' | 'package';
  title: string; // "Offer from Operator X" or Package Title
  operatorName: string;
  operatorVerification: VerificationStatus;
  
  pricePerPerson: number;
  currency: string;
  
  totalNights: number;
  nightsMakkah: number;
  nightsMadinah: number;
  
  hotelStars: 3 | 4 | 5;
  distanceToHaram: string;
  
  inclusions: {
    visa: boolean;
    flights: boolean;
    transfers: boolean;
    meals: boolean;
  };
  
  notes?: string;
}
