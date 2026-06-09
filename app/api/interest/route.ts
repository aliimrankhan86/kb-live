import { NextRequest, NextResponse } from 'next/server';
import { interestSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export async function POST(request: NextRequest) {
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

    const parsed = interestSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { error: issues[0] || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, type } = parsed.data;
    const trimmedEmail = email.trim().toLowerCase();

    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from('interests')
      .insert({ email: trimmedEmail, type });

    if (error) {
      if (error.code === '23505') {
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
      throw error;
    }

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