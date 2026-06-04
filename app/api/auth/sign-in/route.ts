import { NextResponse } from 'next/server';
import { apiSignIn } from '@/lib/auth/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const data = await apiSignIn({ email, password });
    return NextResponse.json({ user: data.user, session: data.session });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}