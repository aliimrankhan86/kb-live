import { NextResponse } from 'next/server';
import { apiSignOut } from '@/lib/auth/api';
import { mapErrorToResponse } from '@/lib/errors';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('__dev_user');

  try {
    await apiSignOut();
    return response;
  } catch (err) {
    if (
      process.env.NODE_ENV === 'development' &&
      err instanceof Error &&
      err.message.includes('Missing Supabase environment variables')
    ) {
      return response;
    }

    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
