import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import type { BookingIntent } from '@/lib/types';
import { z } from 'zod';
import {
  sendBookingIntentConfirmation,
  sendPaymentEvidenceNotification,
} from '@/lib/email/send';

const evidenceFileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  kind: z.enum(['image', 'pdf']),
  lastModified: z.number().optional(),
  uploadedAt: z.string().min(1),
  storagePath: z.string().optional(),
});

const paymentEvidenceSchema = z.object({
  files: z.array(evidenceFileSchema),
  payerName: z.string().optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
  submittedAt: z.string().min(1),
  storageStatus: z.enum(['metadata-only', 'bytes-stored']),
});

const bookingIntentSchema = z.object({
  id: z.string().min(1).optional(),
  offerId: z.string().min(1),
  operatorId: z.string().min(1),
  notes: z.string().max(2000).optional(),
  paymentEvidence: paymentEvidenceSchema.optional(),
  skipProofAcknowledged: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ctx = { userId: user.id, role: user.role };
    const bookingIntents = await Repository.getBookingIntents(ctx);
    return NextResponse.json({ bookingIntents });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const customerId =
      user?.role === 'customer' ? user.id : process.env.E2E_TESTING === '1' ? 'cust1' : null;

    if (!customerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = bookingIntentSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const bookingIntent = await Repository.createBookingIntent(
      { userId: customerId, role: 'customer' },
      parsed.data as Partial<BookingIntent>
    );

    // Fire-and-forget: emails must not fail the API response.
    if (user) {
      void sendBookingEmails(
        user.email,
        user.name ?? '',
        bookingIntent,
        Boolean(parsed.data.paymentEvidence?.files?.length),
      );
    }

    return NextResponse.json({ bookingIntent, persisted: true }, { status: 201 });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

async function sendBookingEmails(
  customerEmail: string,
  customerName: string,
  intent: BookingIntent,
  hasEvidence: boolean,
): Promise<void> {
  try {
    const operator = await Repository.getOperatorById(intent.operatorId);
    const operatorName = operator
      ? (operator.tradingName ?? operator.companyName)
      : 'the operator';

    // Email 4 — booking intent confirmation to customer.
    await sendBookingIntentConfirmation({
      customerEmail,
      customerName: customerName || 'Pilgrim',
      operatorName,
      packageName: null,
      refCode: intent.referenceCode ?? intent.id,
    });

    // Email 5 — payment evidence notification to operator (only when evidence included).
    if (hasEvidence && operator) {
      await sendPaymentEvidenceNotification({
        operatorEmail: operator.contactEmail,
        operatorName,
        customerName: customerName || customerEmail,
        packageName: null,
        refCode: intent.referenceCode ?? intent.id,
      });
    }
  } catch (err) {
    console.error('[email] sendBookingEmails failed:', err);
  }
}
