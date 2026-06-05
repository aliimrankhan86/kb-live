import { NextResponse } from 'next/server';
import { apiGetUser } from '@/lib/auth/api';

export async function GET() {
  const user = await apiGetUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}