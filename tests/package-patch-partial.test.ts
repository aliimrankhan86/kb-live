import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Repository } from '@/lib/api/repository';
import { MockDB } from '@/lib/api/mock-db';
import type { Package } from '@/lib/types';

// Zod 4 fills .default() values inside updatePackageSchema (a .partial()), so a
// PATCH that sent one field also unpublished the package and reset distance
// bands, inclusions, room types and currency. Only sent fields may change.
const operatorId = 'patch-partial-op';
vi.mock('@/lib/auth/session', () => ({ getSessionUser: async () => ({ id: operatorId, role: 'operator' }) }));

const pkg: Package = {
  ...MockDB.getPackages()[0], id: 'patch-1', slug: 'patch-1', operatorId, status: 'published',
  distanceBandMakkah: 'near', distanceBandMadinah: 'medium',
  inclusions: { visa: true, flights: true, transfers: false, meals: null },
  roomOccupancyOptions: { single: false, double: true, triple: true, quad: true },
  airline: 'Old Air',
};

const patch = async (body: Record<string, unknown>) => {
  const { PATCH } = await import('@/app/api/operator/packages/route');
  return PATCH(new NextRequest('http://x/api/operator/packages', { method: 'PATCH', body: JSON.stringify(body) }));
};

beforeEach(() => {
  localStorage.clear();
  MockDB.savePackage(pkg);
});

describe('PATCH /api/operator/packages changes only the fields sent', () => {
  it('a one-field edit leaves status, distance bands, inclusions and room types alone', async () => {
    const res = await patch({ id: 'patch-1', airline: 'New Air' });
    expect(res.status).toBe(200);
    const saved = (await Repository.getPackageById('patch-1'))!;
    expect(saved.airline).toBe('New Air');
    expect(saved.status).toBe('published');
    expect(saved.distanceBandMakkah).toBe('near');
    expect(saved.distanceBandMadinah).toBe('medium');
    expect(saved.inclusions).toEqual(pkg.inclusions);
    expect(saved.roomOccupancyOptions).toEqual(pkg.roomOccupancyOptions);
  });

  it('a room price edit keeps the others, and null clears one to not stated (item 9)', async () => {
    MockDB.savePackage({ ...pkg, priceQuadPerPerson: 1195 });
    expect((await patch({ id: 'patch-1', priceDoublePerPerson: 1595 })).status).toBe(200);
    let saved = (await Repository.getPackageById('patch-1'))!;
    expect([saved.priceQuadPerPerson, saved.priceDoublePerPerson, saved.status]).toEqual([1195, 1595, 'published']);
    expect((await patch({ id: 'patch-1', priceQuadPerPerson: null })).status).toBe(200);
    saved = (await Repository.getPackageById('patch-1'))!;
    expect(saved.priceQuadPerPerson).toBeNull();
  });
});
