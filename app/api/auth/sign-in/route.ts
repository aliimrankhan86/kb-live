import { NextResponse } from 'next/server';
import { apiSignIn } from '@/lib/auth/api';
import { DEV_ACCOUNT_PASSWORD, getDevUserByEmail, isDevAuthEnabled, toSessionUser } from '@/lib/auth/dev-users';
import { AppError, mapErrorToResponse } from '@/lib/errors';
import { signInSchema } from '@/lib/validation';
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
    const devUser = getDevUserByEmail(email);

    if (isDevAuthEnabled() && devUser) {
      if (password.trim() !== DEV_ACCOUNT_PASSWORD) {
        throw new AppError({ code: 'AUTH_INVALID_CREDENTIALS', status: 401 });
      }

      const sessionUser = toSessionUser(devUser);
      const response = NextResponse.json({ user: sessionUser });
      response.cookies.set({
        name: '__dev_user',
        value: JSON.stringify(sessionUser),
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        secure: false,
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

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
