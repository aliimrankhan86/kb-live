import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { AppError } from '@/lib/errors';
import type { UserRole } from '@/lib/types';

export interface SignUpInput {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  marketingConsent?: boolean;
}

export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Sign up with email/password + role metadata.
 */
export async function apiSignUp(input: SignUpInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
        // NOTE: role is deliberately NOT stored in user_metadata. user_metadata is
        // editable by the user via supabase.auth.updateUser({ data }), so trusting it
        // for authorization would allow self-escalation. Role goes to app_metadata below.
        data: {
          name: input.name || input.email.split('@')[0],
          marketingConsent: input.marketingConsent ?? false,
          marketingConsentAt: input.marketingConsent ? new Date().toISOString() : null,
          marketingConsentSource: 'signup_form',
        },
    },
  });
  if (error) {
    const msg = error.message ?? '';
    if (
      msg.toLowerCase().includes('user already registered') ||
      msg.toLowerCase().includes('email_address_already_registered')
    ) {
      throw new AppError({ code: 'AUTH_EMAIL_ALREADY_EXISTS', status: 409 });
    }
    throw new Error(msg);
  }

  // SECURITY: write the authorization role to app_metadata, which only the service
  // role can set. This is the single trusted source read by getSessionUser(),
  // middleware, and /api/auth/me. signUpSchema + the route already constrain role to
  // customer|operator, so admin cannot be self-assigned here.
  const userId = data.user?.id;
  if (userId) {
    const admin = createServiceRoleClient();
    const { error: roleError } = await admin.auth.admin.updateUserById(userId, {
      app_metadata: { role: input.role },
    });
    if (roleError) {
      // Fail loudly: an account without a trusted role would silently behave as a
      // customer, which is a confusing security-relevant state. Surface as 500.
      throw new AppError({ code: 'INTERNAL_ERROR', status: 500 });
    }

    // Sync to Prisma users table so quote_requests FK constraint is satisfied.
    const name = (data.user?.user_metadata?.name as string) || input.name || null;
    await syncUserToPrisma(userId, input.email, input.role, name);
  }

  return data;
}

/**
 * Sign in with email/password.
 */
export async function apiSignIn(input: SignInInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) {
    // Supabase returns "Email not confirmed" when the user hasn't clicked their
    // verification link. Surface this as a specific code so the client can show
    // a helpful message + resend link instead of a generic "wrong credentials".
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      throw new AppError({ code: 'AUTH_EMAIL_NOT_CONFIRMED', status: 403 });
    }
    throw new AppError({ code: 'AUTH_INVALID_CREDENTIALS', status: 401 });
  }

  // Sync to Prisma users table on every sign-in. This covers users who signed
  // up before the FK sync was added — their Prisma row is created on first login.
  const signedInUser = data.user;
  if (signedInUser?.id) {
    const role = (signedInUser.app_metadata?.role as string) || 'customer';
    const name = (signedInUser.user_metadata?.name as string) || null;
    await syncUserToPrisma(signedInUser.id, signedInUser.email!, role, name);
  }

  return data;
}

/**
 * Upsert a row in the Prisma `users` table to match the Supabase auth user.
 * Required because quote_requests.customer_id has a FK to users.id.
 * Only runs when FEATURE_USE_REAL_DB=true (skipped in E2E / test mode).
 * Errors are logged but do not fail the caller — auth already succeeded.
 */
async function syncUserToPrisma(
  userId: string,
  email: string,
  role: string,
  name?: string | null,
): Promise<void> {
  if (process.env.FEATURE_USE_REAL_DB !== 'true') return;
  try {
    const { prisma } = await import('@/lib/api/db/prisma');
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email,
        role: (role as 'customer' | 'operator' | 'admin'),
        name: name ?? null,
      },
      update: { email, name: name ?? null },
    });
  } catch (err) {
    console.error('[auth] Failed to sync user to Prisma users table:', err);
  }
}

/**
 * Sign out — clears session cookies.
 */
export async function apiSignOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/**
 * Get current user from Supabase session.
 */
export async function apiGetUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return {
    id: user.id,
    email: user.email || '',
    // SECURITY: role from app_metadata only (service-role-writable, not user-editable).
    role: (user.app_metadata?.role as UserRole) || 'customer',
    name: (user.user_metadata?.name as string) || null,
  };
}
