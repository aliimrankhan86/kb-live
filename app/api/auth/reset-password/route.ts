import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

const schema = z.object({ email: z.string().trim().max(254).email('Enter a valid email address') });

/**
 * Sends a password reset email. The link goes through /auth/confirm (which
 * exchanges the code for a session) and lands on /reset-password, where the
 * new password is set. Always answers the same way so it cannot reveal whether
 * an account exists.
 */
export async function POST(request: Request) {
  // Email-sending endpoint: rate limited like the other auth routes.
  const rateLimit = await checkRateLimit(getRateLimitIdentifier(request, 'auth'));
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/confirm?next=/reset-password`,
    });
    if (error) console.error('[auth/reset-password]', error.message);
  } catch (err) {
    console.error('[auth/reset-password]', err instanceof Error ? err.message : err);
  }
  return NextResponse.json({ sent: true });
}
