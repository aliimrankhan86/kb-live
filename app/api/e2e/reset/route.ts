import { NextResponse } from 'next/server';
import { resetE2EState } from '@/lib/api/mock-db';

export async function POST() {
  if (process.env.E2E_TESTING !== '1') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  resetE2EState();
  return NextResponse.json({ ok: true });
}
