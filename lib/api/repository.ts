import { MockDB } from './mock-db';
import { BookingIntent, Offer, Package, QuoteRequest, UserRole } from '@/lib/types';
import { generateSlug } from '@/lib/slug';

// Simulate a secure context from the server (e.g. session)
export interface RequestContext {
  userId: string;
  role: UserRole;
}

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
    
    const newIntent: BookingIntent = {
      id: crypto.randomUUID(),
      offerId: intent.offerId!,
      customerId: ctx.userId,
      operatorId: intent.operatorId!,
      status: 'started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: intent.notes,
    };
    
    // In a real DB we would save this.
    // I'll add booking intents to MockDB
    MockDB.saveBookingIntent(newIntent);
    return newIntent;
  },

  getBookingIntents: (ctx: RequestContext): BookingIntent[] => {
    const all = MockDB.getBookingIntents();
    if (ctx.role === 'customer') return all.filter(b => b.customerId === ctx.userId);
    if (ctx.role === 'operator') return all.filter(b => b.operatorId === ctx.userId);
    return all;
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
