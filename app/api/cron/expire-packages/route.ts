import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/api/db/prisma';
import { verifyCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find packages with a past end date in their dateWindow JSON.
    // Using raw SQL because Prisma doesn't support JSON path filters in where clauses.
    const toExpire = await prisma.$queryRaw<Array<{ id: string; title: string }>>`
      SELECT id, title
      FROM packages
      WHERE status IN ('published', 'active')
        AND date_window IS NOT NULL
        AND (date_window->>'end')::date < CURRENT_DATE
    `;

    if (toExpire.length > 0) {
      await prisma.package.updateMany({
        where: { id: { in: toExpire.map((p) => p.id) } },
        data: { status: 'expired' },
      });
    }

    const expired = toExpire.length;
    console.log(
      `[cron/expire-packages] expired=${expired}`,
      expired > 0 ? toExpire.map((p) => p.title).join(', ') : '',
    );

    return NextResponse.json({ ok: true, expired });
  } catch (err) {
    console.error('[cron/expire-packages] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
