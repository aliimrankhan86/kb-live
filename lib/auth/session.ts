import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
}

/**
 * Get the current authenticated user from Supabase session.
 * Returns null if no session or invalid token.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  // E2E test bypass — only active when E2E_TESTING=1 (set by playwright webServer env).
  if (process.env.E2E_TESTING === '1') {
    try {
      const cookieStore = await cookies();
      const e2eCookie = cookieStore.get('__e2e_user');
      if (e2eCookie?.value) {
        const u = JSON.parse(e2eCookie.value);
        if (u?.id && u?.email && u?.role) return u as SessionUser;
      }
    } catch { /* fall through to Supabase */ }
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  const role = (user.user_metadata?.role as UserRole) || 'customer';
  return {
    id: user.id,
    email: user.email || '',
    role,
    name: user.user_metadata?.name || user.user_metadata?.full_name || null,
  };
}

/**
 * Check if current user has required role.
 */
export async function requireRole(allowed: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (!allowed.includes(user.role)) throw new Error('Forbidden');
  return user;
}