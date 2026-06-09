import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import { z } from 'zod';

const approveSchema = z.object({ action: z.literal('approve'), reviewNotes: z.string().optional() });
const rejectSchema = z.object({ action: z.literal('reject'), reviewNotes: z.string().min(10) });
const actionSchema = z.discriminatedUnion('action', [approveSchema, rejectSchema]);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    const ctx = { userId: user.id, role: 'admin' as const };
    const allRequests = await Repository.getBankChangeRequests(ctx);
    const request = allRequests.find((r) => r.id === id) ?? null;
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const activeDetails = await Repository.getPaymentDetails(
      { userId: request.operatorId, role: 'operator' },
      request.operatorId
    );
    const auditEntries = await Repository.getOperatorAuditLog(ctx, request.operatorId);
    const operator = await Repository.getOperatorById(request.operatorId);

    return NextResponse.json({ request, activeDetails: activeDetails ?? null, auditEntries, operator: operator ?? null });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    const ctx = { userId: user.id, role: 'admin' as const };
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const result =
      parsed.data.action === 'approve'
        ? await Repository.approveBankChangeRequest(ctx, id, parsed.data.reviewNotes)
        : await Repository.rejectBankChangeRequest(ctx, id, parsed.data.reviewNotes);

    return NextResponse.json({ request: result });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
