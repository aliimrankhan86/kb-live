import { NextRequest, NextResponse } from 'next/server';
import { Repository } from '@/lib/api/repository';
import { verifyCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

/** Daily: remove personal details from enquiries older than 90 days. Safe to rerun. */
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const anonymised = await Repository.anonymiseExpiredEnquiries();
    console.log(`[cron/enquiry-retention] anonymised=${anonymised}`);
    return NextResponse.json({ ok: true, anonymised });
  } catch (err) {
    console.error('[cron/enquiry-retention] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
