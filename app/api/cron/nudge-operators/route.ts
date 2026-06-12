import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/api/db/prisma';
import { sendOperatorNudge } from '@/lib/email/send';
import { verifyCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find open enquiries older than 48 h with a known operator and nudge not yet sent.
    // Including customer relation for name + email.
    const pending = await prisma.quoteRequest.findMany({
      where: {
        status: 'open',
        createdAt: { lt: fortyEightHoursAgo },
        nudgeSentAt: null,
        sourceOperatorId: { not: null },
      },
      include: {
        customer: { select: { name: true, email: true } },
      },
    });

    let nudged = 0;

    for (const req of pending) {
      const operatorId = req.sourceOperatorId!;

      const operator = await prisma.operatorProfile.findUnique({
        where: { id: operatorId },
        select: { contactEmail: true, tradingName: true, companyName: true },
      });

      if (!operator) continue;

      const hoursOld = Math.floor(
        (Date.now() - req.createdAt.getTime()) / (1000 * 60 * 60),
      );

      await sendOperatorNudge({
        operatorEmail: operator.contactEmail,
        operatorName: operator.tradingName ?? operator.companyName,
        customerName: req.customer.name ?? req.customer.email,
        customerEmail: req.customer.email,
        packageName: 'their Umrah enquiry',
        hoursOld,
        refCode: `QR-${req.id.slice(0, 8).toUpperCase()}`,
      });

      // Mark as nudged so the cron is idempotent — running again won't re-send.
      await prisma.quoteRequest.update({
        where: { id: req.id },
        data: { nudgeSentAt: new Date() },
      });

      nudged++;
    }

    // TODO: Telegram alert (Prompt 7)

    console.log(`[cron/nudge-operators] nudged=${nudged}`);
    return NextResponse.json({ ok: true, nudged });
  } catch (err) {
    console.error('[cron/nudge-operators] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
