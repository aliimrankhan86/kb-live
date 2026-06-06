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
    .regex(/[0-9]/, 'Password must contain at least one number'),
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