import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import type { Offer } from '@/lib/types';
import { z } from 'zod';

const roomOccupancySchema = z.object({
  single: z.boolean(),
  double: z.boolean(),
  triple: z.boolean(),
  quad: z.boolean(),
});

const inclusionsSchema = z.object({
  visa: z.boolean(),
  flights: z.boolean(),
  transfers: z.boolean(),
  meals: z.boolean(),
});

const offerSchema = z.object({
  id: z.string().min(1).optional(),
  requestId: z.string().min(1),
  pricePerPerson: z.number().positive(),
  currency: z.literal('GBP').default('GBP'),
  hotelStars: z.union([z.literal(3), z.literal(4), z.literal(5)]),
  distanceToHaram: z.string().min(1),
  nightsMakkah: z.number().int().min(0),
  nightsMadinah: z.number().int().min(0),
  totalNights: z.number().int().min(1),
  roomOccupancy: roomOccupancySchema,
  inclusions: inclusionsSchema,
  notes: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const canCreateOffer =
      user?.role === 'operator' ||
      (process.env.E2E_TESTING === '1' && user?.role === 'admin');

    if (!user || !canCreateOffer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = offerSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const offer: Offer = {
      ...parsed.data,
      id: parsed.data.id ?? crypto.randomUUID(),
      operatorId: user.id,
      createdAt: new Date().toISOString(),
    };

    const saved = await Repository.createOffer(
      { userId: user.id, role: 'operator' },
      offer
    );

    return NextResponse.json({ offer: saved }, { status: 201 });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
