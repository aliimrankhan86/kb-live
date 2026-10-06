import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';
import { ACCOUNT_DELETE_MANUAL_MESSAGE, ERASED_NAME } from '@/lib/api/repository';
import type { Enquiry, MarketingConsent } from '@/lib/types';

const enquiry = (id: string, email: string): Enquiry => ({
  id, referenceCode: `PC-${id}`, createdAt: '2026-01-01T00:00:00.000Z', packageId: 'pkg-1', operatorId: 'op1',
  name: 'Amina Test', email, phone: '07000000000', message: 'Two adults, March', travelMonth: '2027-03',
});
const consent = (email: string, enquiryReference: string): MarketingConsent => ({
  id: `c-${enquiryReference}`, email, consent: true, consentTimestamp: '2026-01-01T00:00:00.000Z',
  source: 'enquiry_form', enquiryReference, createdAt: '2026-01-01T00:00:00.000Z',
});

const session = { current: null as null | { id: string; role: string; email?: string } };
const deleteUser = vi.fn(async () => ({ error: null as null | { message: string } }));
const signOut = vi.fn(async () => ({}));
vi.mock('@/lib/auth/session', () => ({ getSessionUser: async () => session.current }));
vi.mock('@/lib/supabase/service-role', () => ({ createServiceRoleClient: () => ({ auth: { admin: { deleteUser } } }) }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { signOut } }) }));

const call = async () => {
  const { DELETE } = await import('@/app/api/user/delete/route');
  const res = await DELETE();
  return { status: res.status, body: await res.json() };
};

beforeEach(() => {
  localStorage.clear();
  deleteUser.mockClear();
  deleteUser.mockResolvedValue({ error: null });
  signOut.mockClear();
});

describe('DELETE /api/user/delete really deletes, or says honestly that it did not', () => {
  it('deletes the auth user and app record for a customer with no linked records', async () => {
    session.current = { id: 'cust-clean', role: 'customer' };
    const res = await call();
    expect(res).toEqual({ status: 200, body: { deleted: true } });
    expect(deleteUser).toHaveBeenCalledWith('cust-clean');
    expect(signOut).toHaveBeenCalled();
  });

  it('removes the sign-in last: a failed auth deletion leaves a sign-in that can retry', async () => {
    session.current = { id: 'cust-clean', role: 'customer', email: 'pilgrim@example.test' };
    deleteUser.mockResolvedValueOnce({ error: { message: 'boom' } });
    const res = await call();
    expect(res.status).toBe(500);
    expect(res.body.deleted).toBeUndefined();
    expect(res.body.error).toMatch(/You can still sign in/);
    // Retry succeeds: every step is safe to run again.
    expect(await call()).toEqual({ status: 200, body: { deleted: true } });
    expect(deleteUser).toHaveBeenCalledTimes(2);
  });

  it('a data step failing part way never touches the sign-in, and a retry finishes the job', async () => {
    session.current = { id: 'cust-clean', role: 'customer', email: 'pilgrim@example.test' };
    MockDB.saveEnquiry(enquiry('e1', 'pilgrim@example.test'));
    MockDB.saveMarketingConsent(consent('pilgrim@example.test', 'PC-1'));
    const spy = vi.spyOn(MockDB, 'deleteMarketingConsentsByEmail').mockImplementationOnce(() => {
      throw new Error('db blip');
    });
    const res = await call();
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/You can still sign in/);
    expect(deleteUser).not.toHaveBeenCalled();
    spy.mockRestore();
    expect(await call()).toEqual({ status: 200, body: { deleted: true } });
    expect(MockDB.getMarketingConsents()).toEqual([]);
    expect(deleteUser).toHaveBeenCalledTimes(1);
  });

  it('anonymises the customer\'s enquiries, deletes their marketing consent, and leaves other people\'s alone', async () => {
    session.current = { id: 'cust-clean', role: 'customer', email: 'Pilgrim@Example.test' };
    MockDB.saveEnquiry(enquiry('e1', 'pilgrim@example.test'));
    MockDB.saveEnquiry(enquiry('e2', 'someone@else.test'));
    MockDB.saveMarketingConsent(consent('pilgrim@example.test', 'PC-1'));
    MockDB.saveMarketingConsent(consent('someone@else.test', 'PC-2'));
    expect((await call()).status).toBe(200);
    const [mine, theirs] = MockDB.getEnquiries();
    expect(mine).toMatchObject({ id: 'e1', referenceCode: 'PC-e1', packageId: 'pkg-1', name: ERASED_NAME });
    expect(mine.email).toBeUndefined();
    expect(mine.phone).toBeUndefined();
    expect(mine.message).toBeUndefined();
    expect(theirs).toEqual(enquiry('e2', 'someone@else.test'));
    expect(MockDB.getMarketingConsents().map((c) => c.email)).toEqual(['someone@else.test']);
  });

  it('refuses (409, nothing deleted) for a customer linked to booking records', async () => {
    const intent = MockDB.getBookingIntents()[0] ?? null;
    const customerId = intent?.customerId ?? 'cust1';
    if (!intent) {
      MockDB.saveRequest({ ...(MockDB.getRequests()[0] ?? {}), id: 'rq-linked', customerId } as never);
    }
    session.current = { id: customerId, role: 'customer' };
    const res = await call();
    expect(res.status).toBe(409);
    expect(res.body.error).toBe(ACCOUNT_DELETE_MANUAL_MESSAGE);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('refuses (409, nothing deleted) for operator accounts', async () => {
    session.current = { id: 'op1', role: 'operator' };
    const res = await call();
    expect(res.status).toBe(409);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('requires a session', async () => {
    session.current = null;
    expect((await call()).status).toBe(401);
  });
});

describe('settings page says exactly what deletion does (truth rule)', () => {
  it('names the consent deletion, the enquiry anonymisation and what operators keep', async () => {
    const { readFileSync } = await import('node:fs');
    const page = readFileSync('app/settings/page.tsx', 'utf8');
    expect(page).toContain('any marketing email consent you gave');
    expect(page).toContain('we delete your name, email address, phone number and message, and keep only the reference code, package and date');
    expect(page).toContain('Operators you already sent an enquiry to keep the details you gave them under their own privacy policy');
    expect(page).not.toContain('Enquiries you sent are already with the operator');
  });
});
