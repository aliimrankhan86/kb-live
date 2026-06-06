import { NextResponse } from 'next/server';
import { apiSignIn } from '@/lib/auth/api';
import { signInSchema } from '@/lib/validation';
import { mapErrorToResponse } from '@/lib/errors';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

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
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { error: issues[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const data = await apiSignIn({ email, password });

    // Do NOT return the session object (contains JWT). Cookie is already set server-side.
    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        role: String(data.user?.user_metadata?.role || 'customer'),
        name: (data.user?.user_metadata?.name as string) || null,
      },
    });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}