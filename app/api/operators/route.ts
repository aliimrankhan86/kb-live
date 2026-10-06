import { NextResponse } from 'next/server';
import { Repository } from '@/lib/api/repository';
import { getSessionUser } from '@/lib/auth/session';
import { mapErrorToResponse } from '@/lib/errors';

export async function GET() {
  try {
    // Public: verified operators only (internal fields stripped). Admins see
    // every operator, e.g. to name an operator on a bank-change review.
    const user = await getSessionUser();
    const operators =
      user?.role === 'admin'
        ? await Repository.getOperators({ userId: user.id, role: 'admin' })
        : await Repository.listPublicOperators();
    return NextResponse.json({ operators });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
