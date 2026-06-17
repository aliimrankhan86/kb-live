import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isOperatorSelfServeEnabled } from '@/lib/config';

// Handles the confirmation callback from Supabase signup/recovery emails.
//
// Supabase can call this route in TWO different formats depending on the email
// template and auth flow:
//
//   1. PKCE flow (the default for @supabase/ssr): the email's ConfirmationURL
//      routes through Supabase's /auth/v1/verify endpoint, which then redirects
//      here as  /auth/confirm?code=<auth_code>  . We exchange that code for a
//      session with exchangeCodeForSession(). This requires the code_verifier
//      cookie that was set on this browser during signUp().
//
//   2. OTP / token_hash flow (when the email template uses {{ .TokenHash }}):
//      Supabase redirects here as  /auth/confirm?token_hash=...&type=signup  .
//      We verify it with verifyOtp().
//
// We support BOTH so the confirmation link works regardless of template config.
//
// IMPORTANT: We do NOT use `await cookies()` + createClient() here because
// NextResponse.redirect() creates a fresh response that won't inherit cookies
// written via the Next.js cookieStore. Instead we use createServerClient
// directly with a custom setAll handler that writes cookies onto the redirect
// response itself, so the session is established on the client.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.redirect(new URL('/verify-email?error=config_error', origin));
  }

  // Only act if we actually received a confirmation payload.
  if (!code && !(token_hash && type)) {
    return NextResponse.redirect(new URL('/verify-email?error=invalid_link', origin));
  }

  // Collect cookies that the auth call wants to set, then apply them to the
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

  // Run whichever flow matches the params we received.
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ type: type!, token_hash: token_hash! });

  if (error) {
    return NextResponse.redirect(new URL('/verify-email?error=invalid_link', origin));
  }

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role;
  // Self-serve onboarding is parked (concierge model). When off, send a
  // confirming operator to their dashboard, not the parked onboarding route.
  const operatorLanding = isOperatorSelfServeEnabled() ? '/operator/onboarding' : '/operator/dashboard';
  const destination = role === 'operator' && next === '/' ? operatorLanding : next;
  const redirectUrl = new URL(destination, origin);
  redirectUrl.searchParams.set('verified', '1');

  const response = NextResponse.redirect(redirectUrl);

  // Apply session cookies from the auth call directly onto the redirect response.
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  return response;
}
