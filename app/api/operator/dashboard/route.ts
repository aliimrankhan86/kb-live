import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';

// Dashboard data must come from the server: the browser Repository only reaches
// MockDB, so the dashboard showed seed/empty data instead of the operator's own.
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'operator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const ctx = { userId: user.id, role: user.role };
    const [packages, requests, offers, bookings] = await Promise.all([
      Repository.getPackagesByOperator(user.id),
      Repository.getRequests(ctx),
      Repository.getOffers(ctx),
      Repository.getBookingIntents(ctx),
    ]);
    return NextResponse.json({ packages, requests, offers, bookings });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
