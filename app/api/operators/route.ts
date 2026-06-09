import { NextResponse } from 'next/server';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';

export async function GET() {
  try {
    const operators = await Repository.listPublicOperators();
    return NextResponse.json({ operators });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
