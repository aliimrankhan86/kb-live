import {
  AuditLogEntry,
  BankChangeRequest,
  BookingIntent,
  Complaint,
  Offer,
  OperatorProfile,
  Package,
  PaymentDetails,
  QuoteRequest,
  User,
} from '@/lib/types';

const STORAGE_KEYS = {
  REQUESTS: 'kb_requests',
  OFFERS: 'kb_offers',
  BOOKING_INTENTS: 'kb_bookings',
  PACKAGES: 'kb_packages',
  PACKAGES_SEED_VERSION: 'kb_packages_seed_version',
  USERS: 'kb_users',
  OPERATORS: 'kb_operators',
  PAYMENT_DETAILS: 'kb_payment_details',
  BANK_CHANGE_REQUESTS: 'kb_bank_change_requests',
  AUDIT_LOG: 'kb_audit_log',
  COMPLAINTS: 'kb_complaints',
  INTERESTS: 'kb_interests',
};

const PACKAGES_SEED_VERSION = 3;

const getStorage = <T>(key: string, defaultVal: T): T => {
  if (typeof window === 'undefined') return defaultVal;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = <T>(key: string, val: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
};

const listedEligibility = {
  canReceiveBookings: false,
  bankDetailsActive: false,
  onboardingComplete: false,
};

const normalizeOperator = (operator: OperatorProfile): OperatorProfile => ({
  ...operator,
  tier: operator.tier ?? 'listed',
  eligibilityFlags: {
    ...listedEligibility,
    ...operator.eligibilityFlags,
    canReceiveBookings: operator.eligibilityFlags?.canReceiveBookings ?? false,
  },
});

// Seed Data
const SEED_OPERATORS: OperatorProfile[] = [
  {
    id: 'op1',
    slug: 'al-hidayah-travel',
    companyName: 'Al-Hidayah Travel',
    tradingName: 'Al-Hidayah',
    companyRegistrationNumber: '12345678',
    verificationStatus: 'verified',
    verifiedAt: '2026-02-15T09:00:00.000Z',
    tier: 'verified',
    eligibilityFlags: {
      canReceiveBookings: true,
      bankDetailsActive: true,
      onboardingComplete: true,
    },
    atolNumber: '11234',
    abtaMemberNumber: 'Y1234',
    contactEmail: 'info@alhidayah.com',
    contactPhone: '+44 20 7123 4567',
    officeAddress: {
      line1: '45 Whitechapel Road',
      city: 'London',
      postcode: 'E1 1DU',
      country: 'GB',
    },
    websiteUrl: 'https://alhidayah.example.com',
    servingRegions: ['UK'],
    departureAirports: ['LHR', 'MAN', 'BHX'],
    yearsInBusiness: 12,
    pilgrimageTypesOffered: ['umrah', 'hajj'],
    createdAt: '2024-01-10T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
    branding: {
      logoUrl: 'https://images.unsplash.com/photo-1477511801984-4ad318ed9846?auto=format&fit=crop&w=400&q=80',
      primaryColor: '#D4AF37',
    },
  },
  {
    id: 'op2',
    slug: 'makkah-tours',
    companyName: 'Makkah Tours',
    tradingName: 'Makkah Tours UK',
    companyRegistrationNumber: '87654321',
    verificationStatus: 'verified',
    verifiedAt: '2026-02-15T09:00:00.000Z',
    tier: 'listed',
    eligibilityFlags: {
      canReceiveBookings: false,
      bankDetailsActive: false,
      onboardingComplete: false,
    },
    atolNumber: '54321',
    abtaMemberNumber: 'P6789',
    contactEmail: 'sales@makkahtours.com',
    contactPhone: '+44 161 554 7821',
    officeAddress: {
      line1: '18 Deansgate',
      line2: 'Suite 2A',
      city: 'Manchester',
      postcode: 'M3 1AZ',
      country: 'GB',
    },
    websiteUrl: 'https://makkahtours.example.com',
    servingRegions: ['UK', 'EU'],
    departureAirports: ['MAN', 'LHR', 'LGW', 'BHX'],
    yearsInBusiness: 8,
    pilgrimageTypesOffered: ['umrah', 'hajj'],
    createdAt: '2024-05-02T10:30:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
    branding: {
      logoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
      primaryColor: '#1B6C8F',
    },
  },
];

const SEED_USERS: User[] = [
  { id: 'cust1', email: 'customer@example.com', role: 'customer', name: 'Ali Client' },
  { id: 'op1', email: 'operator@example.com', role: 'operator', name: 'Ahmed Operator' },
];

const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'complaint-1',
    bookingIntentId: 'bi-demo-1',
    referenceCode: 'KT-DEMO-001',
    customerId: 'cust1',
    operatorId: 'op1',
    category: 'booking_problem',
    severity: 'medium',
    description: 'I was told the hotel was closer to Haram than stated in the package.',
    status: 'operator_notified',
    createdAt: '2026-05-20T10:00:00.000Z',
    updatedAt: '2026-05-20T10:00:00.000Z',
  },
];

const SEED_PAYMENT_DETAILS: PaymentDetails[] = [
  {
    id: 'pay_op1_active',
    operatorId: 'op1',
    accountHolderName: 'Al-Hidayah Travel Ltd',
    bankName: 'Example Business Bank',
    sortCode: '20-00-00',
    accountNumber: '12345678',
    currency: 'GBP',
    country: 'GB',
    status: 'active',
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
    activatedAt: '2026-02-15T09:00:00.000Z',
    createdByUserId: 'op1',
    phoneVerifiedAt: '2026-02-15T09:00:00.000Z',
    phoneLastFour: '4567',
  },
];

const SEED_PACKAGES: Package[] = [
  {
    id: 'pkg1',
    operatorId: 'op1',
    title: 'Ramadan 2026 - Last 10 Nights',
    slug: 'ramadan-2026-last-10',
    status: 'published',
    pilgrimageType: 'umrah',
    seasonLabel: 'Ramadan',
    priceType: 'exact',
    pricePerPerson: 1800,
    currency: 'GBP',
    totalNights: 10,
    nightsMakkah: 5,
    nightsMadinah: 5,
    hotelMakkahStars: 5,
    hotelMakkahName: 'Swissotel Makkah',
    hotelMadinahName: 'Anwar Al Madinah Movenpick',
    distanceToHaramMakkahMetres: 180,
    distanceToHaramMadinahMetres: 280,
    distanceBandMakkah: 'near',
    distanceBandMadinah: 'near',
    airline: 'Saudia',
    departureAirport: 'LHR',
    flightType: 'direct',
    depositAmount: 450,
    paymentPlanAvailable: true,
    cancellationPolicy: 'Cancel 45+ days before departure: operator admin fee applies; 30-44 days 50% refund; under 30 days non-refundable.',
    highlights: ['Last 10 nights in Ramadan', '5-star Makkah stay', 'Direct Saudia flights'],
    groupType: 'small-group',
    createdAt: '2025-11-01T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
    roomOccupancyOptions: { single: false, double: true, triple: true, quad: true },
    inclusions: { visa: true, flights: true, transfers: true, meals: false },
    notes: 'Suhoor included.',
    images: [
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'pkg2',
    operatorId: 'op1',
    title: 'Umrah 2026 - 7 Nights Near Haram',
    slug: 'umrah-2026-7-nights-near-haram',
    status: 'published',
    pilgrimageType: 'umrah',
    seasonLabel: 'Ramadan',
    priceType: 'from',
    pricePerPerson: 1200,
    currency: 'GBP',
    totalNights: 7,
    nightsMakkah: 4,
    nightsMadinah: 3,
    hotelMakkahStars: 4,
    hotelMadinahStars: 4,
    hotelMakkahName: 'Elaf Kinda Hotel',
    hotelMadinahName: 'Saja Al Madinah',
    distanceToHaramMakkahMetres: 320,
    distanceToHaramMadinahMetres: 420,
    distanceBandMakkah: 'near',
    distanceBandMadinah: 'near',
    airline: 'British Airways',
    departureAirport: 'MAN',
    flightType: 'one-stop',
    depositAmount: 250,
    paymentPlanAvailable: true,
    cancellationPolicy: 'Free cancellation within 48 hours of booking. After that, cancellation charges apply on a sliding scale up to departure.',
    highlights: ['Near-Haram hotels', 'Family-friendly room options', 'Installment plan available'],
    groupType: 'small-group',
    createdAt: '2025-10-15T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
    roomOccupancyOptions: { single: false, double: true, triple: true, quad: false },
    inclusions: { visa: true, flights: true, transfers: true, meals: false },
    notes: 'Great value Ramadan package.',
    images: [
      'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'pkg3',
    operatorId: 'op1',
    title: 'Hajj 2026 - Standard 7 Nights',
    slug: 'hajj-2026-standard-7-nights',
    status: 'published',
    pilgrimageType: 'hajj',
    seasonLabel: 'Hajj',
    priceType: 'from',
    pricePerPerson: 3200,
    currency: 'GBP',
    totalNights: 7,
    nightsMakkah: 4,
    nightsMadinah: 3,
    hotelMakkahStars: 4,
    hotelMadinahStars: 4,
    hotelMakkahName: 'Voco Makkah',
    hotelMadinahName: 'Rove Al Madinah',
    distanceToHaramMakkahMetres: 920,
    distanceToHaramMadinahMetres: 360,
    distanceBandMakkah: 'medium',
    distanceBandMadinah: 'near',
    departureAirport: 'BHX',
    depositAmount: 700,
    paymentPlanAvailable: false,
    cancellationPolicy: 'Refunds available up to 60 days before travel. Hajj visa and service components become non-refundable once processed.',
    highlights: ['Guided rites support', 'Well-rated 4-star hotels', 'Priority ground transfers'],
    groupType: 'large-group',
    createdAt: '2025-09-20T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
    roomOccupancyOptions: { single: false, double: true, triple: true, quad: false },
    inclusions: { visa: true, flights: false, transfers: true, meals: true },
    notes: 'Guided rites support included.',
    images: [
      'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'pkg4',
    operatorId: 'op2',
    title: 'Umrah 2026 - 7 Nights Value',
    slug: 'umrah-2026-7-nights-value',
    status: 'published',
    pilgrimageType: 'umrah',
    seasonLabel: 'Flexible',
    priceType: 'from',
    pricePerPerson: 750,
    currency: 'GBP',
    totalNights: 7,
    nightsMakkah: 4,
    nightsMadinah: 3,
    hotelMakkahStars: 4,
    hotelMadinahStars: 4,
    hotelMakkahName: 'Emaar Grand Hotel',
    hotelMadinahName: 'Dallah Taibah Hotel',
    distanceToHaramMakkahMetres: 980,
    distanceToHaramMadinahMetres: 500,
    distanceBandMakkah: 'medium',
    distanceBandMadinah: 'near',
    airline: 'Turkish Airlines',
    departureAirport: 'LGW',
    flightType: 'one-stop',
    depositAmount: 150,
    paymentPlanAvailable: true,
    cancellationPolicy: 'Cancellations made 30+ days before departure receive 75% refund. Under 30 days, refund depends on supplier recoveries.',
    highlights: ['Budget-friendly', 'Frequent departures', 'Strong customer support'],
    groupType: 'large-group',
    createdAt: '2025-08-08T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
    roomOccupancyOptions: { single: false, double: true, triple: true, quad: false },
    inclusions: { visa: true, flights: true, transfers: true, meals: false },
    notes: 'Great value for flexible dates.',
    images: [
      'https://images.unsplash.com/photo-1591608511725-1f6d3d07f4c3?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'pkg5',
    operatorId: 'op2',
    title: 'Umrah 2026 - 10 Nights Near Haram',
    slug: 'umrah-2026-10-nights-near-haram',
    status: 'published',
    pilgrimageType: 'umrah',
    seasonLabel: 'Flexible',
    priceType: 'from',
    pricePerPerson: 950,
    currency: 'GBP',
    totalNights: 10,
    nightsMakkah: 6,
    nightsMadinah: 4,
    hotelMakkahStars: 5,
    hotelMadinahStars: 4,
    hotelMakkahName: 'Makkah Clock Royal Tower',
    hotelMadinahName: 'Shaza Regency Plaza',
    distanceToHaramMakkahMetres: 240,
    distanceToHaramMadinahMetres: 390,
    distanceBandMakkah: 'near',
    distanceBandMadinah: 'near',
    airline: 'Qatar Airways',
    departureAirport: 'MAN',
    flightType: 'one-stop',
    depositAmount: 300,
    paymentPlanAvailable: true,
    cancellationPolicy: 'Free date amendment once if requested 21+ days before departure. Standard cancellation fees apply based on booking stage.',
    highlights: ['10-night premium itinerary', 'Close to Haram in Makkah', 'High-demand flexible dates'],
    groupType: 'small-group',
    createdAt: '2025-12-01T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z',
    roomOccupancyOptions: { single: false, double: true, triple: true, quad: true },
    inclusions: { visa: true, flights: true, transfers: true, meals: false },
    notes: 'Premium 10-night package near Haram.',
    images: [
      'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

export const MockDB = {
  getRequests: (): QuoteRequest[] => getStorage(STORAGE_KEYS.REQUESTS, []),
  saveRequest: (req: QuoteRequest) => {
    const requests = MockDB.getRequests();
    const existingIndex = requests.findIndex((r) => r.id === req.id);
    if (existingIndex >= 0) {
      requests[existingIndex] = req;
    } else {
      requests.push(req);
    }
    setStorage(STORAGE_KEYS.REQUESTS, requests);
    return req;
  },
  getRequestById: (id: string) => MockDB.getRequests().find((r) => r.id === id),

  getOffers: (): Offer[] => getStorage(STORAGE_KEYS.OFFERS, []),
  saveOffer: (offer: Offer) => {
    const offers = MockDB.getOffers();
    const existingIndex = offers.findIndex((o) => o.id === offer.id);
    if (existingIndex >= 0) {
      offers[existingIndex] = offer;
    } else {
      offers.push(offer);
    }
    setStorage(STORAGE_KEYS.OFFERS, offers);
    
    // Update request status to responded
    const req = MockDB.getRequestById(offer.requestId);
    if (req && req.status === 'open') {
      MockDB.saveRequest({ ...req, status: 'responded' });
    }
    
    return offer;
  },
  getOffersByRequestId: (requestId: string) =>
    MockDB.getOffers().filter((o) => o.requestId === requestId),

  getBookingIntents: (): BookingIntent[] =>
    getStorage<BookingIntent[]>(STORAGE_KEYS.BOOKING_INTENTS, []).map((booking) => ({
      ...booking,
      referenceCode: booking.referenceCode ?? `KT-LEGACY-${booking.id.slice(0, 8).toUpperCase()}`,
      skipProofAcknowledged: booking.skipProofAcknowledged ?? false,
    })),
  saveBookingIntent: (booking: BookingIntent) => {
    if (!booking.referenceCode) {
      throw new Error('Reference code is required');
    }

    const bookings = MockDB.getBookingIntents();
    const existingIndex = bookings.findIndex((existing) => existing.id === booking.id);
    const duplicateReference = bookings.find(
      (existing) => existing.referenceCode === booking.referenceCode && existing.id !== booking.id
    );

    if (duplicateReference) {
      throw new Error('Reference code must be unique');
    }

    if (existingIndex >= 0) {
      const existing = bookings[existingIndex];
      if (existing.referenceCode !== booking.referenceCode) {
        throw new Error('Reference code cannot be changed');
      }

      bookings[existingIndex] = {
        ...booking,
        id: existing.id,
        referenceCode: existing.referenceCode,
        offerId: existing.offerId,
        customerId: existing.customerId,
        operatorId: existing.operatorId,
        createdAt: existing.createdAt,
      };
    } else {
      bookings.push(booking);
    }
    setStorage(STORAGE_KEYS.BOOKING_INTENTS, bookings);
    return booking;
  },

  getPackages: (): Package[] => {
    const version = getStorage<number>(STORAGE_KEYS.PACKAGES_SEED_VERSION, 0);
    const pkgs = getStorage<Package[]>(STORAGE_KEYS.PACKAGES, []);
    if (pkgs.length === 0 || version < PACKAGES_SEED_VERSION) {
      setStorage(STORAGE_KEYS.PACKAGES, SEED_PACKAGES);
      setStorage(STORAGE_KEYS.PACKAGES_SEED_VERSION, PACKAGES_SEED_VERSION);
      return SEED_PACKAGES;
    }
    return pkgs;
  },
  
  savePackage: (pkg: Package) => {
    const packages = MockDB.getPackages();
    const existingIndex = packages.findIndex((p) => p.id === pkg.id);
    if (existingIndex >= 0) {
      packages[existingIndex] = pkg;
    } else {
      packages.push(pkg);
    }
    setStorage(STORAGE_KEYS.PACKAGES, packages);
    return pkg;
  },
  
  deletePackage: (id: string) => {
    const packages = MockDB.getPackages().filter(p => p.id !== id);
    setStorage(STORAGE_KEYS.PACKAGES, packages);
  },

  getOperators: (): OperatorProfile[] => {
    const ops = getStorage<OperatorProfile[]>(STORAGE_KEYS.OPERATORS, []);
    if (ops.length === 0) {
      setStorage(STORAGE_KEYS.OPERATORS, SEED_OPERATORS.map(normalizeOperator));
      return SEED_OPERATORS.map(normalizeOperator);
    }
    const normalized = ops.map(normalizeOperator);
    if (JSON.stringify(normalized) !== JSON.stringify(ops)) {
      setStorage(STORAGE_KEYS.OPERATORS, normalized);
    }
    return normalized;
  },
  
  getOperatorById: (id: string) => MockDB.getOperators().find(o => o.id === id),

  saveOperator: (operator: OperatorProfile) => {
    const operators = MockDB.getOperators();
    const normalized = normalizeOperator(operator);
    const existingIndex = operators.findIndex((existing) => existing.id === normalized.id);
    if (existingIndex >= 0) {
      operators[existingIndex] = normalized;
    } else {
      operators.push(normalized);
    }
    setStorage(STORAGE_KEYS.OPERATORS, operators);
    return normalized;
  },

  getPaymentDetails: (): PaymentDetails[] => {
    const details = getStorage<PaymentDetails[]>(STORAGE_KEYS.PAYMENT_DETAILS, []);
    if (details.length === 0) {
      setStorage(STORAGE_KEYS.PAYMENT_DETAILS, SEED_PAYMENT_DETAILS);
      return SEED_PAYMENT_DETAILS;
    }
    return details;
  },

  savePaymentDetails: (paymentDetails: PaymentDetails) => {
    const allDetails = MockDB.getPaymentDetails();
    const existingIndex = allDetails.findIndex((existing) => existing.id === paymentDetails.id);
    if (existingIndex >= 0) {
      allDetails[existingIndex] = paymentDetails;
    } else {
      allDetails.push(paymentDetails);
    }
    setStorage(STORAGE_KEYS.PAYMENT_DETAILS, allDetails);
    return paymentDetails;
  },

  getBankChangeRequests: (): BankChangeRequest[] =>
    getStorage<BankChangeRequest[]>(STORAGE_KEYS.BANK_CHANGE_REQUESTS, []),

  saveBankChangeRequest: (request: BankChangeRequest) => {
    const requests = MockDB.getBankChangeRequests();
    const existingIndex = requests.findIndex((existing) => existing.id === request.id);
    if (existingIndex >= 0) {
      requests[existingIndex] = request;
    } else {
      requests.push(request);
    }
    setStorage(STORAGE_KEYS.BANK_CHANGE_REQUESTS, requests);
    return request;
  },

  getAuditLog: (): AuditLogEntry[] => getStorage<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOG, []),

  saveAuditLogEntry: (entry: AuditLogEntry) => {
    const entries = MockDB.getAuditLog();
    entries.push(entry);
    setStorage(STORAGE_KEYS.AUDIT_LOG, entries);
    return entry;
  },

  getComplaints: (): Complaint[] => {
    const complaints = getStorage<Complaint[]>(STORAGE_KEYS.COMPLAINTS, []);
    if (complaints.length === 0) {
      setStorage(STORAGE_KEYS.COMPLAINTS, SEED_COMPLAINTS);
      return SEED_COMPLAINTS;
    }
    return complaints;
  },

  saveComplaint: (complaint: Complaint) => {
    const complaints = MockDB.getComplaints();
    const existingIndex = complaints.findIndex((c) => c.id === complaint.id);
    if (existingIndex >= 0) {
      complaints[existingIndex] = complaint;
    } else {
      complaints.push(complaint);
    }
    setStorage(STORAGE_KEYS.COMPLAINTS, complaints);
    return complaint;
  },

  getInterests: (): { email: string; type: string; createdAt: string }[] =>
    getStorage<{ email: string; type: string; createdAt: string }[]>(STORAGE_KEYS.INTERESTS, []),

  saveInterest: (email: string, type: string) => {
    const interests = MockDB.getInterests();
    interests.push({ email, type, createdAt: new Date().toISOString() });
    setStorage(STORAGE_KEYS.INTERESTS, interests);
    return { email, type, createdAt: new Date().toISOString() };
  },

  // For simulation
  currentUser: SEED_USERS[0], // Default to customer
  setCurrentUser: (role: 'customer' | 'operator') => {
    if (role === 'customer') MockDB.currentUser = SEED_USERS[0];
    else MockDB.currentUser = SEED_USERS[1];
  }
};
