import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export async function POST(request: Request) {
  // Strict rate limit — resend is a potential email-bombing vector
  const rateLimitId = getRateLimitIdentifier(request, 'auth');
  const rateLimit = await checkRateLimit(rateLimitId);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    const supabase = await createClient();
    // Always returns success to prevent email enumeration.
    await supabase.auth.resend({ type: 'signup', email: parsed.data.email });

    return NextResponse.json({ ok: true });
  } catch {
    // Swallow and return ok — no enumeration risk.
    return NextResponse.json({ ok: true });
  }
}
