import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import type { QuoteRequest } from '@/lib/types';

const quoteRequestSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(['umrah', 'hajj']),
  season: z.enum(['ramadan', 'hajj', 'school-holidays', 'flexible', 'custom']),
  dateWindow: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
      flexible: z.boolean(),
    })
    .optional(),
  departureCity: z.string().max(80).optional(),
  totalNights: z.number().int().min(1).max(90),
  nightsMakkah: z.number().int().min(0).max(90),
  nightsMadinah: z.number().int().min(0).max(90),
  hotelStars: z.union([z.literal(3), z.literal(4), z.literal(5)]),
  distancePreference: z.enum(['near', 'medium', 'far', 'range']),
  budgetRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
      currency: z.string().length(3),
    })
    .optional(),
  occupancy: z.object({
    single: z.number().int().min(0),
    double: z.number().int().min(0),
    triple: z.number().int().min(0),
    quad: z.number().int().min(0),
  }),
  inclusions: z.object({
    visa: z.boolean(),
    flights: z.boolean(),
    transfers: z.boolean(),
    meals: z.boolean(),
  }),
  notes: z.string().max(1000).optional(),
  sourcePackageId: z.string().optional(),
  sourceOperatorId: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'customer') {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const requests = await Repository.getRequests({ userId: user.id, role: 'customer' });
    return NextResponse.json({ requests });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting — throttle by IP to prevent burst abuse. Scoped separately from auth + interest budgets.
  const rateLimit = await checkRateLimit(getRateLimitIdentifier(request, 'quote'));
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
  }

  try {
    const user = await getSessionUser();

    if (!user || user.role !== 'customer') {
      return NextResponse.json(
        { error: 'You must be signed in as a customer to submit a quote request.' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address before submitting a quote request. Check your inbox for a verification link.', code: 'AUTH_EMAIL_NOT_VERIFIED' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = quoteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const now = new Date().toISOString();
    const quoteRequest: QuoteRequest = {
      ...parsed.data,
      id: parsed.data.id ?? crypto.randomUUID(),
      customerId: user.id,
      status: 'open',
      createdAt: now,
    };

    const saved = await Repository.createQuoteRequest({ userId: user.id, role: 'customer' }, quoteRequest);

    return NextResponse.json({ request: saved }, { status: 201 });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
