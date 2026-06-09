import { NextResponse } from 'next/server';
import { apiSignOut } from '@/lib/auth/api';
import { mapErrorToResponse } from '@/lib/errors';

export async function POST() {
  const response = NextResponse.json({ success: true });

  try {
    await apiSignOut();
    return response;
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
