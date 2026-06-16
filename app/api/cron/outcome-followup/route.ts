import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/api/db/prisma';
import { sendOutcomeFollowup } from '@/lib/email/send';
import { verifyCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    // Booking intents 10–14 days old with no outcome and followup not yet sent.
    const pending = await prisma.bookingIntent.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo, lte: tenDaysAgo },
        outcome: null,
        outcomeFollowupSentAt: null,
      },
      include: {
        customer: { select: { name: true, email: true } },
        operator: { select: { tradingName: true, companyName: true } },
      },
    });

    let sent = 0;

    for (const intent of pending) {
      const operatorName =
        intent.operator.tradingName ?? intent.operator.companyName;
      const refCode = intent.referenceCode ?? `PC-${intent.id.slice(0, 8).toUpperCase()}`;

      await sendOutcomeFollowup({
        customerEmail: intent.customer.email,
        customerName: intent.customer.name ?? intent.customer.email,
        operatorName,
        packageName: 'your Umrah booking',
        refCode,
        intentId: intent.id,
      });

      // Idempotency: mark sent so a re-run won't fire a duplicate.
      await prisma.bookingIntent.update({
        where: { id: intent.id },
        data: { outcomeFollowupSentAt: new Date() },
      });

      sent++;
    }

    console.log(`[cron/outcome-followup] sent=${sent}`);
    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error('[cron/outcome-followup] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
