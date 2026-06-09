import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import { z } from 'zod';

const createSchema = z.object({
  bookingIntentId: z.string().uuid(),
  category: z.enum(['payment_issue', 'service_quality', 'package_description', 'booking_problem', 'other']),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string().min(10).max(2000),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ctx = { userId: user.id, role: user.role };
    const complaints = await Repository.getComplaints(ctx);
    return NextResponse.json({ complaints });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'customer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const ctx = { userId: user.id, role: 'customer' as const };
    const complaint = await Repository.createComplaint(ctx, parsed.data);
    return NextResponse.json({ complaint }, { status: 201 });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
