import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import { z } from 'zod';

const outcomeSchema = z.object({
  bookingIntentId: z.string().uuid(),
  outcome: z.enum(['travelled', 'cancelled_operator', 'cancelled_customer', 'no_show', 'disputed']),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = outcomeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const ctx = { userId: user.id, role: user.role };
    const outcome = await Repository.createBookingOutcome(
      ctx,
      parsed.data.bookingIntentId,
      parsed.data.outcome,
      parsed.data.notes
    );

    return NextResponse.json({ outcome }, { status: 201 });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
