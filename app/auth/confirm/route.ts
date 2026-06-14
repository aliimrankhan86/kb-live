import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Handles the magic link / OTP callback from Supabase confirmation emails.
// Supabase sends users to: /auth/confirm?token_hash=...&type=signup&next=/
//
// IMPORTANT: We do NOT use `await cookies()` + createClient() here because
// NextResponse.redirect() creates a fresh response that won't inherit cookies
// written via the Next.js cookieStore. Instead we use createServerClient
// directly with a custom setAll handler that writes cookies onto the redirect
// response itself.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.redirect(new URL('/verify-email?error=config_error', origin));
    }

    // Collect cookies that verifyOtp wants to set, then apply them to the
    // redirect response so the session is established on the client.
    const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet);
        },
      },
    });

    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.app_metadata?.role;
      const destination = role === 'operator' && next === '/' ? '/operator/onboarding' : next;
      const redirectUrl = new URL(destination, origin);
      redirectUrl.searchParams.set('verified', '1');

      const response = NextResponse.redirect(redirectUrl);

      // Apply session cookies from verifyOtp directly onto the redirect response
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
      });

      return response;
    }
  }

  return NextResponse.redirect(new URL('/verify-email?error=invalid_link', origin));
}
