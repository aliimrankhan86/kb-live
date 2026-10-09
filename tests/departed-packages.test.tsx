import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import { hasDeparted, londonToday } from '@/lib/listing';
import { DepartedNotice } from '@/components/packages/DepartedNotice';
import type { OperatorProfile, Package } from '@/lib/types';

// Batch 1 item 8: a departure before today (London) leaves every public list.
const base = MockDB.getPackages()[0];
const op: OperatorProfile = { id: 'op-dep', companyName: 'op-dep', slug: 'op-dep', verificationStatus: 'verified', contactEmail: 'op@example.com', atolNumber: 'ATOL-T1' };
const pkg = (id: string, start?: string, extra: Partial<Package> = {}): Package => ({
  ...base, id, slug: id, operatorId: op.id, status: 'published', departureAirport: 'BHX',
  dateWindow: start ? { start, end: start } : undefined, ...extra,
});

describe('hasDeparted', () => {
  it('is true only when the start date is before today, or the cron marked it expired', () => {
    expect(hasDeparted({ status: 'published', dateWindow: { start: '2026-10-08', end: '2026-10-18' } }, '2026-10-09')).toBe(true);
    expect(hasDeparted({ status: 'published', dateWindow: { start: '2026-10-09', end: '2026-10-19' } }, '2026-10-09')).toBe(false);
    expect(hasDeparted({ status: 'published', dateWindow: undefined }, '2026-10-09')).toBe(false);
    expect(hasDeparted({ status: 'published', dateWindow: { start: '', end: '' } }, '2026-10-09')).toBe(false);
    expect(hasDeparted({ status: 'expired', dateWindow: { start: '2027-01-01', end: '2027-01-10' } }, '2026-10-09')).toBe(true);
  });

  it('uses the London calendar day, not UTC', () => {
    expect(londonToday(new Date('2026-10-09T23:30:00Z'))).toBe('2026-10-10'); // BST
    expect(londonToday(new Date('2027-01-05T23:30:00Z'))).toBe('2027-01-05'); // GMT
  });
});

describe('departed packages are not listed publicly', () => {
  beforeEach(() => {
    localStorage.clear();
    MockDB.saveOperator(op);
    MockDB.savePackage(pkg('dep-past', '2026-08-20', { departureAirport: 'GLA' })); // staging package 9 style
    MockDB.savePackage(pkg('dep-today', londonToday()));
    MockDB.savePackage(pkg('dep-future', '2099-01-10'));
    MockDB.savePackage(pkg('dep-undated'));
    MockDB.savePackage(pkg('dep-expired', '2099-02-01', { status: 'expired', departureAirport: 'BRS' }));
  });

  it('leaves past and cron-expired departures out of the list (search, browse, compare, operator page, sitemap)', async () => {
    const ids = (await Repository.listPackages()).map((p) => p.id);
    expect(ids).not.toContain('dep-past');
    expect(ids).not.toContain('dep-expired');
    expect(ids).toEqual(expect.arrayContaining(['dep-today', 'dep-future', 'dep-undated']));
  });

  it('refuses an enquiry for a departed package but keeps its page reachable for the notice', async () => {
    expect(await Repository.getPublicPackageById('dep-past')).toBeUndefined();
    expect(await Repository.getPublicPackageById('dep-expired')).toBeUndefined();
    expect(await Repository.getPublicPackageById('dep-future')).toBeDefined();
    expect((await Repository.getPublicPackageBySlug('dep-past'))?.id).toBe('dep-past');
    expect((await Repository.getPublicPackageBySlug('dep-expired'))?.id).toBe('dep-expired');
  });

  it('drops a departure airport served only by departed packages', async () => {
    const cities = await Repository.getDistinctDepartureCities();
    expect(cities).not.toContain('Glasgow');
    expect(cities).not.toContain('Bristol');
    expect(cities).toContain('Birmingham');
  });
});

describe('DepartedNotice', () => {
  it('says the departure has passed, links back to packages and has no enquiry form', () => {
    const { container } = render(<DepartedNotice pkg={{ title: '10 night summer Umrah from Heathrow, August 2026', dateWindow: { start: '2026-08-20', end: '2026-08-30' } }} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('This departure has passed');
    expect(screen.getByText(/departed on 20 Aug 2026/)).toBeTruthy();
    expect(screen.getByTestId('package-departed-back').getAttribute('href')).toBe('/packages');
    expect(container.querySelector('form')).toBeNull();
  });
});
