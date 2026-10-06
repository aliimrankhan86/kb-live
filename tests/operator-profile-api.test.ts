import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';

const session = { current: null as null | { id: string; role: string } };
vi.mock('@/lib/auth/session', () => ({ getSessionUser: async () => session.current }));

const patch = async (body: unknown) => {
  const { PATCH } = await import('@/app/api/operator/profile/route');
  return PATCH(new NextRequest('http://x/api/operator/profile', { method: 'PATCH', body: JSON.stringify(body) }));
};

const op = () => MockDB.getOperators()[0];

beforeEach(() => localStorage.clear());

describe('PATCH /api/operator/profile', () => {
  it('only operators may save', async () => {
    session.current = { id: 'c1', role: 'customer' };
    expect((await patch({ companyName: 'X', contactEmail: 'a@b.co' })).status).toBe(403);
  });

  it('persists through the server Repository for the session operator', async () => {
    const target = op();
    session.current = { id: target.id, role: 'operator' };
    const res = await patch({ companyName: 'Renamed Ltd', contactEmail: 'ops@renamed.co.uk' });
    expect(res.status).toBe(200);
    expect((await Repository.getOperatorById(target.id))?.companyName).toBe('Renamed Ltd');
  });

  it('rejects attempts to set trust fields', async () => {
    const target = op();
    session.current = { id: target.id, role: 'operator' };
    const res = await patch({ companyName: 'X Ltd', contactEmail: 'a@b.co', verificationStatus: 'verified' });
    expect(res.status).toBe(400);
  });
});

describe('Repository.updateOperator protects verification state', () => {
  it('an operator cannot change verification fields and a new ATOL number loses its old check date', async () => {
    const target = { ...op(), verificationStatus: 'pending' as const, atolNumber: '111', atolVerifiedAt: '2026-01-01T00:00:00.000Z' };
    MockDB.saveOperator(target);
    const ctx = { userId: target.id, role: 'operator' as const };
    const updated = await Repository.updateOperator(ctx, target.id, {
      verificationStatus: 'verified', atolNumber: '222', tier: 'verified_plus',
    });
    expect(updated.verificationStatus).toBe('pending');
    expect(updated.tier).toBe(target.tier);
    expect(updated.atolNumber).toBe('222');
    expect(updated.atolVerifiedAt).toBeUndefined();
  });
});
