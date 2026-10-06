import { beforeEach, describe, expect, it } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import type { OperatorProfile, Package } from '@/lib/types';

// Founder decision 2026-10-06: unverified operators are not listed publicly.
const base = MockDB.getPackages()[0];
const op = (id: string, verificationStatus: OperatorProfile['verificationStatus'], atolNumber: string | undefined = 'ATOL-T1'): OperatorProfile => ({
  id, companyName: id, slug: id, verificationStatus, contactEmail: `${id}@example.com`, atolNumber,
});
const pkg = (id: string, operatorId: string): Package => ({ ...base, id, slug: id, operatorId, status: 'published', departureAirport: 'BHX' });

beforeEach(() => {
  localStorage.clear();
  MockDB.saveOperator(op('op-verified', 'verified'));
  MockDB.saveOperator(op('op-pending', 'pending'));
  MockDB.saveOperator(op('op-rejected', 'rejected'));
  MockDB.savePackage(pkg('pkg-verified', 'op-verified'));
  MockDB.savePackage(pkg('pkg-pending', 'op-pending'));
  MockDB.savePackage(pkg('pkg-rejected', 'op-rejected'));
  MockDB.saveOperator(op('op-no-atol', 'verified', '  '));
  MockDB.savePackage({ ...pkg('pkg-no-atol', 'op-no-atol'), departureAirport: 'NCL' });
});

describe('only verified operators are listed publicly', () => {
  it('lists, finds by slug/id and counts cities only for verified operators', async () => {
    const ids = (await Repository.listPackages()).map((p) => p.id);
    expect(ids).toContain('pkg-verified');
    expect(ids).not.toContain('pkg-pending');
    expect(ids).not.toContain('pkg-rejected');
    expect(await Repository.getPublicPackageBySlug('pkg-verified')).toBeDefined();
    expect(await Repository.getPublicPackageBySlug('pkg-pending')).toBeUndefined();
    expect(await Repository.getPublicPackageById('pkg-rejected')).toBeUndefined();
    expect(await Repository.getPublicOperatorBySlug('op-pending')).toBeUndefined();
    expect(await Repository.getPublicOperatorBySlug('op-verified')).toBeDefined();
  });
});

describe('a verified operator with no ATOL number is not listed (we check each ATOL number before listing)', () => {
  it('hides its packages, profile, operator entry and departure airports', async () => {
    expect((await Repository.listPackages()).map((p) => p.id)).not.toContain('pkg-no-atol');
    expect(await Repository.getPublicPackageBySlug('pkg-no-atol')).toBeUndefined();
    expect(await Repository.getPublicPackageById('pkg-no-atol')).toBeUndefined();
    expect(await Repository.getPublicOperatorBySlug('op-no-atol')).toBeUndefined();
    expect((await Repository.listPublicOperators()).map((o) => o.id)).not.toContain('op-no-atol');
    expect(await Repository.getDistinctDepartureCities()).not.toContain('Newcastle');
  });

  it('an operator changing its own ATOL number goes back to pending until an admin checks it again', async () => {
    const saved = await Repository.updateOperator({ userId: 'op-verified', role: 'operator' }, 'op-verified', { atolNumber: 'ATOL-NEW' });
    expect(saved.verificationStatus).toBe('pending');
    expect((await Repository.listPackages()).map((p) => p.id)).not.toContain('pkg-verified');
  });

  it('an operator editing other fields stays verified; an admin changing the number does not reset it', async () => {
    expect((await Repository.updateOperator({ userId: 'op-verified', role: 'operator' }, 'op-verified', { yearsInBusiness: 9 })).verificationStatus).toBe('verified');
    expect((await Repository.updateOperator({ userId: 'admin', role: 'admin' }, 'op-verified', { atolNumber: 'ATOL-ADMIN' })).verificationStatus).toBe('verified');
  });
});

describe('operator-facing copy matches the ATOL listing rule', () => {
  it('never promises a listing without an ATOL number, and warns that a new number pauses the listing', async () => {
    const { readFileSync } = await import('node:fs');
    const reg = readFileSync('components/operator/OperatorRegistrationForm.tsx', 'utf8');
    const profile = readFileSync('components/operator/OperatorProfileForm.tsx', 'utf8');
    expect(reg).not.toContain('prominent warning on your listings');
    expect(reg).toContain('We only list operators with an ATOL number.');
    expect(profile).not.toContain('Add ATOL number to increase trust');
    expect(profile).toContain('Changing your ATOL number takes your packages off the public listing until we check the new number.');
  });
});
