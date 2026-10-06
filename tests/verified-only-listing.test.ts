import { beforeEach, describe, expect, it } from 'vitest';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import type { OperatorProfile, Package } from '@/lib/types';

// Founder decision 2026-10-06: unverified operators are not listed publicly.
const base = MockDB.getPackages()[0];
const op = (id: string, verificationStatus: OperatorProfile['verificationStatus']): OperatorProfile => ({
  id, companyName: id, slug: id, verificationStatus, contactEmail: `${id}@example.com`,
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
