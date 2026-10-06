import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';
import { ACCOUNT_DELETE_MANUAL_MESSAGE } from '@/lib/api/repository';

const session = { current: null as null | { id: string; role: string } };
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

  it('never claims success when the auth deletion fails', async () => {
    session.current = { id: 'cust-clean', role: 'customer' };
    deleteUser.mockResolvedValueOnce({ error: { message: 'boom' } });
    const res = await call();
    expect(res.status).toBe(500);
    expect(res.body.deleted).toBeUndefined();
    expect(res.body.error).toMatch(/Nothing has been deleted/);
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
