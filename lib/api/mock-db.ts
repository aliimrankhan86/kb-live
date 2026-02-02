import { QuoteRequest, Offer, OperatorProfile, User, BookingIntent, Package } from '@/lib/types';

const STORAGE_KEYS = {
  REQUESTS: 'kb_requests',
  OFFERS: 'kb_offers',
  BOOKING_INTENTS: 'kb_bookings',
  PACKAGES: 'kb_packages',
  USERS: 'kb_users',
  OPERATORS: 'kb_operators',
};

const getStorage = <T>(key: string, defaultVal: T): T => {
  if (typeof window === 'undefined') return defaultVal;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = <T>(key: string, val: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
};

// Seed Data
const SEED_OPERATORS: OperatorProfile[] = [
  {
    id: 'op1',
    companyName: 'Al-Hidayah Travel',
    verificationStatus: 'verified',
    contactEmail: 'info@alhidayah.com',
  },
  {
    id: 'op2',
    companyName: 'Makkah Tours',
    verificationStatus: 'verified',
    contactEmail: 'sales@makkahtours.com',
  },
];

const SEED_USERS: User[] = [
  { id: 'cust1', email: 'customer@example.com', role: 'customer', name: 'Ali Client' },
  { id: 'op1', email: 'operator@example.com', role: 'operator', name: 'Ahmed Operator' },
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
    distanceBandMakkah: 'near',
    distanceBandMadinah: 'near',
    roomOccupancyOptions: { single: false, double: true, triple: true, quad: true },
    inclusions: { visa: true, flights: true, transfers: true, meals: false },
    notes: 'Suhoor included.',
  }
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

  getBookingIntents: (): BookingIntent[] => getStorage(STORAGE_KEYS.BOOKING_INTENTS, []),
  saveBookingIntent: (booking: BookingIntent) => {
    const bookings = MockDB.getBookingIntents();
    bookings.push(booking);
    setStorage(STORAGE_KEYS.BOOKING_INTENTS, bookings);
    return booking;
  },

  getPackages: (): Package[] => {
    const pkgs = getStorage<Package[]>(STORAGE_KEYS.PACKAGES, []);
    if (pkgs.length === 0) {
      setStorage(STORAGE_KEYS.PACKAGES, SEED_PACKAGES);
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
      setStorage(STORAGE_KEYS.OPERATORS, SEED_OPERATORS);
      return SEED_OPERATORS;
    }
    return ops;
  },
  
  getOperatorById: (id: string) => MockDB.getOperators().find(o => o.id === id),

  // For simulation
  currentUser: SEED_USERS[0], // Default to customer
  setCurrentUser: (role: 'customer' | 'operator') => {
    if (role === 'customer') MockDB.currentUser = SEED_USERS[0];
    else MockDB.currentUser = SEED_USERS[1];
  }
};
