import { QuoteRequest, Offer, OperatorProfile, User } from '@/lib/types';

const STORAGE_KEYS = {
  REQUESTS: 'kb_requests',
  OFFERS: 'kb_offers',
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
