export type UserRole = 'customer' | 'operator' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface OperatorProfile {
  id: string; // linked to User.id
  companyName: string;
  tradingName?: string;
  slug?: string; // url-friendly
  companyRegistrationNumber?: string;
  verificationStatus: VerificationStatus;
  atolNumber?: string;
  abtaMemberNumber?: string;
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

export type Season = 'ramadan' | 'hajj' | 'school-holidays' | 'flexible' | 'custom';

export interface QuoteRequest {
  id: string;
  customerId: string; // User.id (or guest ID if allowed)
  status: 'open' | 'responded' | 'closed';
  createdAt: string; // ISO date
  
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

export interface BookingIntent {
  id: string;
  offerId: string;
  customerId: string;
  operatorId: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
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
