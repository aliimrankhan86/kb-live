import { z } from 'zod';

/**
 * Zod schemas for all API route inputs.
 * All user inputs must be validated before hitting database or API endpoints.
 */

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email must be 254 characters or fewer')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or fewer')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['customer', 'operator'] as const),
  name: z
    .string()
    .max(100, 'Name must be 100 characters or fewer')
    .optional(),
  marketingConsent: z.boolean().optional(),
});

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email must be 254 characters or fewer')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const interestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(254, 'Email must be 254 characters or fewer')
    .email('Enter a valid email address'),
  type: z.enum(['hajj', 'umrah'] as const),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type InterestInput = z.infer<typeof interestSchema>;

// ─── Reusable utility validators (non-Zod) ───────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const UK_PHONE_RE = /^(?:\+44\s?|0)(?:[12]\d{1,4}|7\d{1,3})\s?\d{3,4}\s?\d{3,4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate an email address (RFC 5322 lite + length guard). */
export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Email is required' };
  if (trimmed.length > 254) return { valid: false, error: 'Email must be 254 characters or fewer' };
  if (!EMAIL_RE.test(trimmed)) return { valid: false, error: 'Enter a valid email address' };
  return { valid: true };
}

/** Validate a UK phone number. */
export function validatePhone(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Phone number is required' };
  if (!UK_PHONE_RE.test(trimmed)) return { valid: false, error: 'Enter a valid UK phone number' };
  return { valid: true };
}

/** Validate that a value is non-empty (string, number, or boolean). */
export function validateRequired<T>(value: T | null | undefined, fieldName: string): ValidationResult {
  if (value === null || value === undefined) return { valid: false, error: `${fieldName} is required` };
  if (typeof value === 'string' && value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

/** Validate string length within bounds. */
export function validateLength(
  value: string,
  {
    min,
    max,
    fieldName,
  }: { min?: number; max?: number; fieldName: string }
): ValidationResult {
  const trimmed = value.trim();
  if (min !== undefined && trimmed.length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  if (max !== undefined && trimmed.length > max) {
    return { valid: false, error: `${fieldName} must be ${max} characters or fewer` };
  }
  return { valid: true };
}

import type { OperatorProfile, Package } from '@/lib/types';

/** Validate an operator is eligible to publish packages. */
export function validateOperatorForPublish(operator: OperatorProfile): ValidationResult {
  if (operator.verificationStatus !== 'verified') {
    return { valid: false, error: 'Operator must be verified before publishing packages' };
  }
  if (operator.tier === 'listed') {
    return { valid: false, error: 'Operator tier must be above listed to publish' };
  }
  if (!operator.eligibilityFlags?.bankDetailsActive) {
    return { valid: false, error: 'Active bank details are required to publish packages' };
  }
  if (!operator.eligibilityFlags?.onboardingComplete) {
    return { valid: false, error: 'Operator onboarding must be complete before publishing' };
  }
  return { valid: true };
}

/** Minimum checks for saving a package as draft. */
export function validatePackageForDraft(pkg: Partial<Package>): ValidationResult {
  const titleCheck = validateRequired(pkg.title, 'Title');
  if (!titleCheck.valid) return titleCheck;

  const titleLen = validateLength(pkg.title!, { min: 5, max: 120, fieldName: 'Title' });
  if (!titleLen.valid) return titleLen;

  if (pkg.pricePerPerson === undefined || pkg.pricePerPerson <= 0) {
    return { valid: false, error: 'Price per person must be greater than 0' };
  }

  if (pkg.totalNights === undefined || pkg.totalNights < 2) {
    return { valid: false, error: 'Total nights must be at least 2' };
  }
  if (pkg.nightsMakkah === undefined || pkg.nightsMakkah < 1) {
    return { valid: false, error: 'Makkah nights must be at least 1' };
  }
  if (pkg.nightsMadinah === undefined || pkg.nightsMadinah < 1) {
    return { valid: false, error: 'Madinah nights must be at least 1' };
  }
  if ((pkg.nightsMakkah ?? 0) + (pkg.nightsMadinah ?? 0) !== pkg.totalNights) {
    return { valid: false, error: 'Makkah nights plus Madinah nights must equal total nights' };
  }

  return { valid: true };
}

/** Full checks required to publish a package (includes all draft checks). */
export function validatePackageForPublish(pkg: Partial<Package>): ValidationResult {
  const draft = validatePackageForDraft(pkg);
  if (!draft.valid) return draft;

  const policyCheck = validateRequired(pkg.cancellationPolicy, 'Cancellation policy');
  if (!policyCheck.valid) return policyCheck;

  const policyLen = validateLength(pkg.cancellationPolicy!, { min: 10, max: 1000, fieldName: 'Cancellation policy' });
  if (!policyLen.valid) return policyLen;

  if (!pkg.inclusions) {
    return { valid: false, error: 'Inclusions are required to publish' };
  }

  const occupancy = pkg.roomOccupancyOptions;
  if (!occupancy || (!occupancy.single && !occupancy.double && !occupancy.triple && !occupancy.quad)) {
    return { valid: false, error: 'At least one room occupancy option must be selected' };
  }

  return { valid: true };
}
