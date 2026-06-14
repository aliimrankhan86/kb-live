import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import { z } from 'zod';

const detailsSchema = z.object({
  details: z.object({
    accountHolderName: z.string().min(1),
    bankName: z.string().min(1),
    sortCode: z.string(),
    accountNumber: z.string(),
    currency: z.string().length(3),
    country: z.string().length(2),
  }),
  phoneConfirmation: z.object({ confirmed: z.boolean(), phoneLastFour: z.string().length(4) }),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'operator' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ctx = { userId: user.id, role: 'operator' as const };
    const [activeDetails, allRequests] = await Promise.all([
      Repository.getPaymentDetails(ctx, user.id),
      Repository.getBankChangeRequests(ctx),
    ]);

    const pendingRequest =
      allRequests.find((r) => r.status === 'pending_review' || r.status === 'approved') ?? null;
    const rejectedRequest =
      !pendingRequest
        ? [...allRequests]
            .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
            .find((r) => r.status === 'rejected') ?? null
        : null;

    return NextResponse.json({
      activeDetails: activeDetails ?? null,
      pendingRequest,
      rejectedRequest,
    });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'operator' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const parsed = detailsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const ctx = { userId: user.id, role: 'operator' as const };
    const paymentDetails = await Repository.createPaymentDetails(ctx, {
      operatorId: user.id,
      details: parsed.data.details,
      phoneConfirmation: parsed.data.phoneConfirmation,
    });
    return NextResponse.json({ paymentDetails }, { status: 201 });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
