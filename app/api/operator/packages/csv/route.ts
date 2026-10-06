import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';

// CSV import/export must run on the server: in the browser the Repository only
// reaches the in-memory MockDB, so client-side import/export never touched the
// real database (imports were silently lost).
const MAX_CSV_BYTES = 1_000_000;

async function operatorCtx() {
  const user = await getSessionUser();
  return user && user.role === 'operator' ? { userId: user.id, role: user.role } : null;
}

export async function GET() {
  try {
    const ctx = await operatorCtx();
    if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const csv = await Repository.exportPackagesAsCsv(ctx);
    return new NextResponse(csv, { status: 200, headers: { 'content-type': 'text/csv; charset=utf-8' } });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await operatorCtx();
    if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const text = await request.text();
    if (text.length > MAX_CSV_BYTES) return NextResponse.json({ error: 'CSV is too large (max 1 MB)' }, { status: 413 });
    const result = await Repository.importPackagesFromCsv(ctx, text);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && /CSV must contain|Missing required columns/.test(err.message)) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
