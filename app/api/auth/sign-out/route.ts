import { NextResponse } from 'next/server';
import { apiSignOut } from '@/lib/auth/api';

export async function POST() {
  try {
    await apiSignOut();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign out failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}