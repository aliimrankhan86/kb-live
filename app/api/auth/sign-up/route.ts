import { NextResponse } from 'next/server';
import { apiSignUp } from '@/lib/auth/api';
import type { UserRole } from '@/lib/types';

const VALID_ROLES: UserRole[] = ['customer', 'operator', 'admin'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, name } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be customer, operator, or admin' },
        { status: 400 }
      );
    }

    const data = await apiSignUp({ email, password, role, name });
    return NextResponse.json({ user: data.user, session: data.session }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign up failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}