import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Handles the magic link / OTP callback from Supabase confirmation emails.
// Supabase sends users to: /auth/confirm?token_hash=...&type=signup&next=/
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // Redirect to the intended destination (or home) with a verified flag
      // so the page can show a "Email verified!" banner.
      const redirectUrl = new URL(next, origin);
      redirectUrl.searchParams.set('verified', '1');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL('/verify-email?error=invalid_link', origin));
}
