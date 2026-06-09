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
    const entries = await Repository.getOperatorAuditLog(ctx, user.id);
    return NextResponse.json({ entries });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
