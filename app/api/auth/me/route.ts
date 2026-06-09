import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { mapErrorToResponse } from '@/lib/errors';

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ user });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
