import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import { z } from 'zod';

const patchSchema = z.union([
  z.object({ op: z.literal('status'), status: z.string() }),
  z.object({ op: z.literal('notes'), notes: z.string(), flagOperator: z.boolean().optional() }),
  z.object({ op: z.literal('response'), response: z.string() }),
]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const ctx = { userId: user.id, role: user.role };
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    let complaint;
    if (parsed.data.op === 'status') {
      complaint = await Repository.updateComplaintStatus(ctx, id, parsed.data.status as Parameters<typeof Repository.updateComplaintStatus>[2]);
    } else if (parsed.data.op === 'notes') {
      complaint = await Repository.updateComplaintAdminNotes(ctx, id, parsed.data.notes, parsed.data.flagOperator);
    } else {
      complaint = await Repository.updateComplaintOperatorResponse(ctx, id, parsed.data.response);
    }

    return NextResponse.json({ complaint });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
