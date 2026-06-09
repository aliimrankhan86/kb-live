import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const ctx = { userId: user.id, role: 'admin' as const };
    const allRequests = await Repository.getBankChangeRequests(ctx);
    const pending = allRequests.filter((r) => r.status === 'pending_review');
    const operators = await Repository.listPublicOperators();
    const operatorById = Object.fromEntries(operators.map((o) => [o.id, o]));
    return NextResponse.json({ requests: pending, operatorById });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
