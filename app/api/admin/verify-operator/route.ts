import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import { z } from 'zod';

const verifySchema = z.object({
  operatorId: z.string().min(1),
  type: z.enum(['atol', 'abta']),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { operatorId, type } = parsed.data;
    const ctx = { userId: user.id, role: user.role };

    const operator =
      type === 'atol'
        ? await Repository.verifyOperatorAtol(ctx, operatorId)
        : await Repository.verifyOperatorAbta(ctx, operatorId);

    return NextResponse.json({
      operatorId: operator.id,
      [type === 'atol' ? 'atolVerifiedAt' : 'abtaVerifiedAt']:
        type === 'atol' ? operator.atolVerifiedAt : operator.abtaVerifiedAt,
    });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
