import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

export interface SignUpInput {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
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
      data: {
        role: input.role,
        name: input.name || input.email.split('@')[0],
      },
    },
  });
  if (error) throw new Error(error.message);
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
  if (error) throw new Error(error.message);
  return data;
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
    role: (user.user_metadata?.role as UserRole) || 'customer',
    name: (user.user_metadata?.name as string) || null,
  };
}