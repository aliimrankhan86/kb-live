import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';
import { ERASED_NAME, RETENTION_ERASED_NAME, Repository } from '@/lib/api/repository';
import type { Enquiry } from '@/lib/types';

const NOW = new Date('2026-10-06T12:00:00.000Z');
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const enquiry = (id: string, createdAt: string, extra: Partial<Enquiry> = {}): Enquiry => ({
  id, referenceCode: `PC-${id}`, createdAt, packageId: 'pkg-1', operatorId: 'op1',
  packageTitle: 'Umrah 10 nights', operatorName: 'Operator One', travelMonth: '2027-03',
  name: 'Amina Test', email: 'amina@example.test', phone: '07000000000', message: 'Two adults', ...extra,
});

beforeEach(() => localStorage.clear());

describe('enquiry retention: personal details removed after 90 days', () => {
  it('anonymises enquiries older than 90 days exactly like account deletion, keeping what lead billing needs', async () => {
    MockDB.saveEnquiry(enquiry('old', daysAgo(91)));
    MockDB.saveEnquiry(enquiry('young', daysAgo(89)));
    expect(await Repository.anonymiseExpiredEnquiries(NOW)).toBe(1);

    const [old, young] = MockDB.getEnquiries();
    expect(old).toEqual({
      id: 'old', referenceCode: 'PC-old', createdAt: daysAgo(91), packageId: 'pkg-1', operatorId: 'op1',
      packageTitle: 'Umrah 10 nights', operatorName: 'Operator One', travelMonth: '2027-03',
      name: RETENTION_ERASED_NAME, email: undefined, phone: undefined, message: undefined,
    });
    expect(young).toEqual(enquiry('young', daysAgo(89)));
  });

  it('is safe to rerun: a second pass changes nothing and counts nothing', async () => {
    MockDB.saveEnquiry(enquiry('old', daysAgo(120)));
    await Repository.anonymiseExpiredEnquiries(NOW);
    const after = MockDB.getEnquiries();
    expect(await Repository.anonymiseExpiredEnquiries(NOW)).toBe(0);
    expect(MockDB.getEnquiries()).toEqual(after);
  });

  it('leaves an enquiry already erased by account deletion alone', async () => {
    MockDB.saveEnquiry(enquiry('gone', daysAgo(200), { name: ERASED_NAME, email: undefined, phone: undefined, message: undefined }));
    expect(await Repository.anonymiseExpiredEnquiries(NOW)).toBe(0);
    expect(MockDB.getEnquiries()[0].name).toBe(ERASED_NAME);
  });

  it('removes a name left on an old enquiry even when no contact details remain', async () => {
    MockDB.saveEnquiry(enquiry('name-only', daysAgo(95), { email: undefined, phone: undefined, message: undefined }));
    expect(await Repository.anonymiseExpiredEnquiries(NOW)).toBe(1);
    expect(MockDB.getEnquiries()[0].name).toBe(RETENTION_ERASED_NAME);
  });
});

describe('GET /api/cron/enquiry-retention follows the cron convention', () => {
  const env = process.env.CRON_SECRET;
  afterEach(() => { process.env.CRON_SECRET = env; });
  const call = async (auth?: string) => {
    const { GET } = await import('@/app/api/cron/enquiry-retention/route');
    const res = await GET(new NextRequest('http://localhost/api/cron/enquiry-retention', auth ? { headers: { authorization: auth } } : {}));
    return { status: res.status, body: await res.json() };
  };

  it('refuses without the cron secret', async () => {
    process.env.CRON_SECRET = 'test-secret';
    expect((await call()).status).toBe(401);
    expect((await call('Bearer wrong')).status).toBe(401);
  });

  it('anonymises expired enquiries and reports the count', async () => {
    process.env.CRON_SECRET = 'test-secret';
    MockDB.saveEnquiry(enquiry('old', '2020-01-01T00:00:00.000Z'));
    expect(await call('Bearer test-secret')).toEqual({ status: 200, body: { ok: true, anonymised: 1 } });
    expect(await call('Bearer test-secret')).toEqual({ status: 200, body: { ok: true, anonymised: 0 } });
  });

  it('is scheduled daily in vercel.json like the other crons', () => {
    const { crons } = JSON.parse(readFileSync('vercel.json', 'utf8')) as { crons: { path: string; schedule: string }[] };
    expect(crons).toContainEqual({ path: '/api/cron/enquiry-retention', schedule: '0 3 * * *' });
  });
});

describe('privacy page states the enquiry retention the code applies', () => {
  const page = readFileSync('app/privacy/page.tsx', 'utf8');
  it('says personal details are removed after 90 days and what is kept', () => {
    expect(page).toContain('Your name, email address, phone number and message are removed 90 days after you send the enquiry. We keep the reference code, operator, package and date.');
    expect(page).not.toContain('Enquiry and booking intent data');
  });
});
