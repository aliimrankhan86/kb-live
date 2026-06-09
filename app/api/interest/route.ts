import { NextRequest, NextResponse } from 'next/server';
import { MockDB } from '@/lib/api/mock-db';
import { interestSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting — prevent interest-list spam
  const rateLimitId = getRateLimitIdentifier(request, 'interest');
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
    const parsed = interestSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { error: issues[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, type } = parsed.data;

    const trimmedEmail = email.trim();

    // Server-side deduplication: skip if same email+type already exists
    const existing = MockDB.getInterests().find(
      (i) => i.email.toLowerCase() === trimmedEmail.toLowerCase() && i.type === type
    );
    if (existing) {
      return NextResponse.json(
        {
          message:
            'You are already on the list. We will notify you when packages are available.',
          email: trimmedEmail,
          type,
        },
        { status: 200 }
      );
    }

    MockDB.saveInterest(trimmedEmail, type);

    return NextResponse.json(
      { message: 'Interest registered successfully', email: trimmedEmail, type },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        error:
          'Unable to process your request right now. Please try again later.',
      },
      { status: 500 }
    );
  }
}