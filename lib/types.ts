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
  verificationStatus: VerificationStatus;
  contactEmail: string;
  contactPhone?: string;
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
  
  // Comparison Fields (matches Offer)
  pricePerPerson: number;
  currency: string;
  
  totalNights: number;
  nightsMakkah: number;
  nightsMadinah: number;
  
  hotelStars: 3 | 4 | 5;
  distanceToHaram: string;
  
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
  
  season: Season;
  availableDates: {
    start: string;
    end: string;
  }[];
  
  description?: string;
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
