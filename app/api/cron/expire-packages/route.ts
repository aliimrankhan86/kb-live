import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/api/db/prisma';
import { verifyCronSecret } from '@/lib/cron-auth';
import { storedEndDay } from '@/lib/listing';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Read the end date as text and check it here: a cast in SQL throws on an
    // empty or malformed end and failed the whole nightly run. Those rows are
    // skipped and logged; the rule is unchanged (end date before today).
    const rows = await prisma.$queryRaw<Array<{ id: string; title: string; end_date: string | null; today: string }>>`
      SELECT id, title, date_window->>'end' AS end_date, CURRENT_DATE::text AS today
      FROM packages
      WHERE status IN ('published', 'active')
        AND date_window IS NOT NULL
    `;

    const toExpire: typeof rows = [];
    const skipped: string[] = [];
    for (const row of rows) {
      const end = storedEndDay(row.end_date);
      if (end === null) {
        skipped.push(row.id);
        console.warn(
          `[cron/expire-packages] skipped id=${row.id} title="${row.title}": end date ${JSON.stringify(row.end_date)} is empty or not a valid date`,
        );
      } else if (end < row.today) {
        toExpire.push(row);
      }
    }

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

    return NextResponse.json({ ok: true, expired, skipped });
  } catch (err) {
    console.error('[cron/expire-packages] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
