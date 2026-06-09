import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { mapErrorToResponse } from '@/lib/errors';
import type { ReconciliationRow } from '@/lib/types';

const querySchema = z
  .object({
    from: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid from date'),
    to: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid to date'),
    format: z.enum(['csv', 'json']).default('json'),
  })
  .refine((v) => Date.parse(v.from) <= Date.parse(v.to), {
    message: 'from date must be on or before to date',
    path: ['from'],
  });

const CSV_HEADERS = [
  'Reference Code',
  'Status',
  'Operator',
  'Customer Payment Ref',
  'Payer Name',
  'Evidence Status',
  'Outcome',
  'Outcome Date',
  'Booking Created',
  'Quote ID',
];

const escapeCsv = (value: string | undefined) => {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const toCsv = (rows: ReconciliationRow[]) => {
  const body = rows.map((r) =>
    [
      r.referenceCode,
      r.status,
      r.operatorName,
      r.paymentReference,
      r.payerName,
      r.evidenceStatus,
      r.outcome,
      r.outcomeReportedAt,
      r.bookingCreatedAt,
      r.quoteRequestId,
    ]
      .map(escapeCsv)
      .join(',')
  );
  return [CSV_HEADERS.join(','), ...body].join('\n');
};

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = request.nextUrl.searchParams;
    const parsed = querySchema.safeParse({
      from: params.get('from') ?? undefined,
      to: params.get('to') ?? undefined,
      format: params.get('format') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid query' }, { status: 400 });
    }

    const { from, to, format } = parsed.data;
    const ctx = { userId: user.id, role: user.role };
    // Include the full `to` day by extending to end-of-day.
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setUTCHours(23, 59, 59, 999);

    const rows = await Repository.getReconciliationData(ctx, fromDate, toDate);

    if (format === 'csv') {
      const csv = toCsv(rows);
      const filename = `reconciliation_${from}_to_${to}.csv`;
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ rows, count: rows.length });
  } catch (err) {
    const { body, status } = mapErrorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
