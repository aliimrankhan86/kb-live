import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ctx = { userId: user.id, role: 'operator' as const };
    const [requests, offers, bookings, outcomes] = await Promise.all([
      Repository.getRequests(ctx),
      Repository.getOffers(ctx),
      Repository.getBookingIntents(ctx),
      Repository.getBookingOutcomes(ctx),
    ]);
    return NextResponse.json({ requests, offers, bookings, outcomes });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
