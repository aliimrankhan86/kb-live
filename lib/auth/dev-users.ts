import type { UserRole } from '@/lib/types';

export const DEV_ACCOUNT_PASSWORD = 'KaabaTrip!2026';

export interface DevAuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  label: string;
  description: string;
  color: string;
  defaultRedirect: string;
}

export const DEV_AUTH_USERS = {
  customer: {
    id: 'cust1',
    email: 'customer@example.com',
    role: 'customer',
    name: 'Ali Client',
    label: 'Customer',
    description: 'Standard customer account - browse packages, request quotes, track requests.',
    color: '#4A9EFF',
    defaultRedirect: '/',
  },
  operator: {
    id: 'op1',
    email: 'operator@example.com',
    role: 'operator',
    name: 'Ahmed Operator',
    label: 'Operator (Verified)',
    description: 'Verified operator - full dashboard, packages, leads, profile, payment details.',
    color: '#FFD31D',
    defaultRedirect: '/operator/dashboard',
  },
  operatorNew: {
    id: 'op2',
    email: 'operator2@example.com',
    role: 'operator',
    name: 'Fatima Operator',
    label: 'Operator (New / Unverified)',
    description: 'New operator - onboarding flow, incomplete profile, no bank details.',
    color: '#E8A838',
    defaultRedirect: '/operator/onboarding',
  },
  admin: {
    id: 'op1',
    email: 'admin@example.com',
    role: 'admin',
    name: 'Admin User',
    label: 'Admin',
    description: 'Admin account - bank changes, complaints triage, operator verification.',
    color: '#FF6B6B',
    defaultRedirect: '/admin/complaints',
  },
} as const satisfies Record<string, DevAuthUser>;

export type DevAuthKey = keyof typeof DEV_AUTH_USERS;

export function getDevUserByEmail(email: string): DevAuthUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  return Object.values(DEV_AUTH_USERS).find((user) => user.email === normalizedEmail) ?? null;
}

export function isDevAuthEnabled() {
  if (process.env.KAABATRIP_ENABLE_DEV_AUTH === 'true') return true;
  if (process.env.KAABATRIP_ENABLE_DEV_AUTH === 'false') return false;
  if (process.env.E2E_TESTING === '1') return true;
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) return true;
  return Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production');
}

export function toSessionUser(user: DevAuthUser) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
}
