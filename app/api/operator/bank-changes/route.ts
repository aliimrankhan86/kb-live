import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import { z } from 'zod';

const createSchema = z.object({
  proposedDetails: z.object({
    accountHolderName: z.string().min(1),
    bankName: z.string().min(1),
    sortCode: z.string(),
    accountNumber: z.string(),
    currency: z.string().length(3),
    country: z.string().length(2),
  }),
  phoneConfirmation: z.object({ confirmed: z.boolean(), phoneLastFour: z.string().length(4) }),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'operator' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const ctx = { userId: user.id, role: 'operator' as const };
    const bankChangeRequest = await Repository.createBankChangeRequest(ctx, {
      operatorId: user.id,
      proposedDetails: parsed.data.proposedDetails,
      phoneConfirmation: parsed.data.phoneConfirmation,
      reason: parsed.data.reason,
    });
    return NextResponse.json({ bankChangeRequest }, { status: 201 });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
