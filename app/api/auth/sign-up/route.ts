import { NextResponse } from 'next/server';
import { apiSignUp } from '@/lib/auth/api';
import { signUpSchema } from '@/lib/validation';
import { mapErrorToResponse } from '@/lib/errors';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

const VALID_ROLES = ['customer', 'operator'] as const;

export async function POST(request: Request) {
  // Rate limiting
  const rateLimitId = getRateLimitIdentifier(request);
  const rateLimit = await checkRateLimit(rateLimitId);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfter) },
      }
    );
  }

  try {
    const body = await request.json();

    // Zod validation
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { error: issues[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, password, role, name, marketingConsent } = parsed.data;

    // Defence in depth: double-check role is not admin
    if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
      return NextResponse.json(
        { error: 'Invalid role. Must be customer or operator' },
        { status: 400 }
      );
    }

    const data = await apiSignUp({ email, password, role, name, marketingConsent });

    // Do NOT return the session object (contains JWT). Cookie is already set server-side.
    return NextResponse.json(
      {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role,
          name: name || email.split('@')[0],
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}