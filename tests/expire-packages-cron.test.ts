import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { storedEndDay } from '@/lib/listing';

const rows: Array<{ id: string; title: string; end_date: string | null; today: string }> = [];
const updateMany = vi.fn();
vi.mock('@/lib/api/db/prisma', () => ({
  prisma: { $queryRaw: async () => rows, package: { updateMany: (...a: unknown[]) => updateMany(...a) } },
}));
vi.mock('@/lib/cron-auth', () => ({ verifyCronSecret: () => true }));

import { GET } from '@/app/api/cron/expire-packages/route';

describe('storedEndDay', () => {
  it('keeps real calendar days and ignores a trailing time', () => {
    expect(storedEndDay('2026-08-30')).toBe('2026-08-30');
    expect(storedEndDay('2026-08-30T10:00:00Z')).toBe('2026-08-30');
  });
  it('returns null for empty, missing and malformed values', () => {
    for (const v of ['', null, undefined, ' ', 'soon', '2026-02-30', '2026-13-01', '30/08/2026', '2026-8-30']) {
      expect(storedEndDay(v)).toBeNull();
    }
  });
});

describe('GET /api/cron/expire-packages', () => {
  beforeEach(() => {
    rows.length = 0;
    updateMany.mockReset();
  });

  it('skips and logs empty and malformed end dates, expires only the past one, returns 200', async () => {
    const today = '2026-10-09';
    rows.push(
      { id: 'empty', title: 'Start date only', end_date: '', today },
      { id: 'bad', title: 'Typo date', end_date: '2026-02-30', today },
      { id: 'past', title: 'Returned', end_date: '2026-10-08', today },
      { id: 'today', title: 'Returns today', end_date: today, today },
    );
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const res = await GET({} as NextRequest);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, expired: 1, skipped: ['empty', 'bad'] });
    expect(updateMany).toHaveBeenCalledWith({ where: { id: { in: ['past'] } }, data: { status: 'expired' } });
    expect(warn.mock.calls.map((c) => c[0])).toEqual([
      '[cron/expire-packages] skipped id=empty title="Start date only": end date "" is empty or not a valid date',
      '[cron/expire-packages] skipped id=bad title="Typo date": end date "2026-02-30" is empty or not a valid date',
    ]);
    warn.mockRestore();
  });
});
