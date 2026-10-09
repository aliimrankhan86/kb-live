import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Repository } from '@/lib/api/repository';
import { MockDB } from '@/lib/api/mock-db';
import type { Package } from '@/lib/types';

const session = { current: null as null | { id: string; role: string } };
vi.mock('@/lib/auth/session', () => ({ getSessionUser: async () => session.current }));

const operatorId = 'csv-roundtrip-op';
const ctx = { userId: operatorId, role: 'operator' as const };

const full: Package = {
  id: 'rt-1', operatorId, title: 'Round trip, "quoted" package', slug: 'rt-1', status: 'published', pilgrimageType: 'umrah',
  seasonLabel: 'Christmas holidays', dateWindow: { start: '2026-12-18', end: '2026-12-28' },
  priceType: 'from', pricePerPerson: 1495, currency: 'GBP', totalNights: 10, nightsMakkah: 6, nightsMadinah: 4,
  hotelMakkahStars: 4, hotelMadinahStars: 5, hotelMakkahName: 'Hotel A', hotelMadinahName: 'Hotel B',
  distanceToHaramMakkahMetres: 350, distanceToHaramMadinahMetres: 150, distanceBandMakkah: 'near', distanceBandMadinah: 'near',
  airline: 'Test Air', departureAirport: 'LHR', flightType: 'direct', depositAmount: 300, paymentPlanAvailable: false,
  cancellationPolicy: 'Line one of the policy.\nLine two, with a comma.', groupType: 'small-group',
  ziyaratIncluded: false, ziyaratDetails: 'None stated',
  roomOccupancyOptions: { single: false, double: true, triple: true, quad: false },
  inclusions: { visa: true, flights: true, transfers: false, meals: true },
  notes: 'Notes',
  priceQuadPerPerson: 1195, priceTriplePerPerson: 1350.5, priceDoublePerPerson: 1595,
};

// The other state of every field: true where full has false, not stated where
// full states a value, a stated zero deposit, other enum values (item 4).
const other: Package = {
  id: 'rt-2', operatorId, title: 'Round trip, other states', slug: 'rt-2', status: 'published', pilgrimageType: 'hajj',
  dateWindow: { start: '2027-05-10', end: '' },
  priceType: 'exact', pricePerPerson: 7950.75, currency: 'GBP', totalNights: 20, nightsMakkah: 14, nightsMadinah: 6,
  hotelMakkahStars: 3, distanceBandMakkah: 'far', distanceBandMadinah: 'unknown',
  depositAmount: 0, paymentPlanAvailable: true, groupType: 'large-group', ziyaratIncluded: true,
  roomOccupancyOptions: { single: true, double: false, triple: false, quad: true },
  inclusions: { visa: null, flights: false, transfers: null, meals: false },
  priceQuadPerPerson: null, priceDoublePerPerson: 8100,
};

const DECISION_FIELDS = [
  'title', 'pilgrimageType', 'seasonLabel', 'dateWindow', 'priceType', 'pricePerPerson', 'currency', 'totalNights',
  'nightsMakkah', 'nightsMadinah', 'hotelMakkahStars', 'hotelMadinahStars', 'hotelMakkahName', 'hotelMadinahName',
  'distanceToHaramMakkahMetres', 'distanceToHaramMadinahMetres', 'distanceBandMakkah', 'distanceBandMadinah',
  'airline', 'departureAirport', 'flightType', 'depositAmount', 'paymentPlanAvailable', 'cancellationPolicy',
  'groupType', 'ziyaratIncluded', 'ziyaratDetails', 'roomOccupancyOptions', 'inclusions', 'notes',
  'priceQuadPerPerson', 'priceTriplePerPerson', 'priceDoublePerPerson',
] as const;

beforeEach(() => {
  localStorage.clear();
  for (const p of MockDB.getPackages().filter((p) => p.operatorId === operatorId)) MockDB.deletePackage(p.id);
});

describe('CSV round trip keeps every decision field', () => {
  const roundTrip = async (pkg: Package) => {
    await Repository.createPackage(ctx, pkg);
    const csv = await Repository.exportPackagesAsCsv(ctx);
    const { saved, errors } = await Repository.importPackagesFromCsv(ctx, csv);
    expect(errors).toEqual([]);
    return saved[0];
  };

  // One test per field and state. Not stated may come back as undefined or
  // null: both read "Not provided".
  describe.each([['stated values', full], ['the other states', other]] as const)('%s', (_, pkg) => {
    it.each(DECISION_FIELDS)('%s', async (field) => {
      const back = await roundTrip(pkg);
      expect(back[field] ?? null).toEqual(pkg[field] ?? null);
    });
  });
});

describe('CSV room prices (item 9)', () => {
  const header = 'title,pricePerPerson,currency,totalNights,pilgrimageType';
  it('imports an older CSV without the room price columns, as not stated', async () => {
    const { saved, errors } = await Repository.importPackagesFromCsv(ctx, `${header}\nOld file,1200,GBP,10,umrah`);
    expect(errors).toEqual([]);
    expect(saved[0].pricePerPerson).toBe(1200);
    expect([saved[0].priceQuadPerPerson, saved[0].priceTriplePerPerson, saved[0].priceDoublePerPerson]).toEqual([null, null, null]);
  });

  it('exports the three columns, blank when not stated', async () => {
    await Repository.createPackage(ctx, { ...other, title: 'Export check', priceQuadPerPerson: 1195, priceTriplePerPerson: null, priceDoublePerPerson: 1595 });
    const [head, row] = (await Repository.exportPackagesAsCsv(ctx)).split('\n');
    const cols = head.split(',');
    const cells = row.split(',');
    const at = (c: string) => cells[cols.indexOf(c)];
    expect([at('priceQuadPerPerson'), at('priceTriplePerPerson'), at('priceDoublePerPerson')]).toEqual(['1195', '', '1595']);
  });

  it.each(['0', '-10', 'abc'])('refuses the row when a room price is %s, never storing 0', async (bad) => {
    const { saved, errors } = await Repository.importPackagesFromCsv(ctx, `${header},priceTriplePerPerson\nBad room price,1200,GBP,10,umrah,${bad}`);
    expect(saved).toEqual([]);
    expect(errors).toEqual([{ row: 2, reason: 'Triple room (3 sharing) price must be a positive number or blank' }]);
  });
});

describe('CSV import states only what the file says', () => {
  const header = 'title,pricePerPerson,currency,totalNights,pilgrimageType';
  it('does not invent a nights split, payment plan, ziyarat, end date or enum values', async () => {
    const csv = `${header},dateWindowStart,groupType,flightType,distanceBandMakkah,departureAirport\nBare package,1200,GBP,10,umrah,2026-12-01,family,teleport,close,Heathrow Airport`;
    const { saved } = await Repository.importPackagesFromCsv(ctx, csv);
    const p = saved[0];
    expect(p.nightsMakkah).toBe(0);
    expect(p.nightsMadinah).toBe(0);
    expect(p.paymentPlanAvailable).toBeUndefined();
    expect(p.ziyaratIncluded).toBeUndefined();
    expect(p.dateWindow).toEqual({ start: '2026-12-01', end: '' });
    expect(p.groupType).toBeUndefined();
    expect(p.flightType).toBeUndefined();
    expect(p.distanceBandMakkah).toBe('unknown');
    expect(p.departureAirport).toBe('LHR');
  });
});

describe('/api/operator/packages/csv runs on the server for the signed-in operator', () => {
  it('rejects anyone who is not an operator', async () => {
    const { GET, POST } = await import('@/app/api/operator/packages/csv/route');
    session.current = { id: 'c1', role: 'customer' };
    expect((await GET()).status).toBe(403);
    const { NextRequest } = await import('next/server');
    expect((await POST(new NextRequest('http://x/api/operator/packages/csv', { method: 'POST', body: 'a' }))).status).toBe(403);
  });

  it('imports into the store for the session operator, not a client-supplied id', async () => {
    const { POST } = await import('@/app/api/operator/packages/csv/route');
    const { NextRequest } = await import('next/server');
    session.current = { id: operatorId, role: 'operator' };
    const res = await POST(new NextRequest('http://x/api/operator/packages/csv', {
      method: 'POST',
      body: 'title,pricePerPerson,currency,totalNights,pilgrimageType\nServer import,999,GBP,7,umrah',
    }));
    expect(res.status).toBe(200);
    const stored = (await Repository.getPackagesByOperator(operatorId)).map((p) => p.title);
    expect(stored).toContain('Server import');
  });
});
