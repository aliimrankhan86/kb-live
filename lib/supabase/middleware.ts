import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isDevAuthEnabled } from '@/lib/auth/dev-users';

export interface AuthResult {
  user: { id: string; email: string; role: string } | null;
  response: NextResponse;
}

/**
 * Next.js middleware for Supabase session refresh + auth extraction.
 * Attaches refreshed session cookies to the response.
 * Returns both the response and the authenticated user (if any).
 */
export async function updateSession(request: NextRequest): Promise<AuthResult> {
  let supabaseResponse = NextResponse.next({ request });

  // E2E test bypass — only active when E2E_TESTING=1 (set by playwright webServer env).
  // next.config.ts forwards this into Edge Runtime at build time; production builds
  // compile it to '' so the condition is never true in real deployments.
  if (process.env.E2E_TESTING === '1') {
    const e2eCookie = request.cookies.get('__e2e_user');
    if (e2eCookie?.value) {
      try {
        const u = JSON.parse(e2eCookie.value) as { id: string; email: string; role: string };
        if (u?.id && u?.email && u?.role) {
          return { user: u, response: supabaseResponse };
        }
      } catch { /* invalid JSON — fall through to Supabase */ }
    }
  }

  // Dev login bypass — localhost + automated E2E only. Never on deployed envs.
  if (isDevAuthEnabled()) {
    const devCookie = request.cookies.get('__dev_user');
    if (devCookie?.value) {
      try {
        const u = JSON.parse(devCookie.value) as { id: string; email: string; role: string };
        if (u?.id && u?.email && u?.role) {
          return { user: u, response: supabaseResponse };
        }
      } catch { /* invalid JSON — fall through to Supabase */ }
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // In dev-auth environments without Supabase configured, allow through.
    if (isDevAuthEnabled()) {
      return { user: null, response: supabaseResponse };
    }
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    );
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session if expired — required for Server Components to have valid auth state
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role as string | undefined;

  return {
    user: user
      ? {
          id: user.id,
          email: user.email || '',
          role: role || 'customer',
        }
      : null,
    response: supabaseResponse,
  };
}
