import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { inflateSync } from 'node:zlib';
import {
  ACCOUNTS_FILE, ERASED_NAME, PRODUCTION_REF, RETENTION_ERASED_NAME,
  assertStagingTarget, parseArgs, slugify, solidPng,
} from '../scripts/seed-staging.mjs';
import {
  ACCOUNTS, COMPLAINTS, ENQUIRIES, LEADS, OPERATORS, PACKAGES, SEED_ID_PREFIX, roomPriceNote, seedId,
} from '../scripts/seed-staging-data.mjs';
import * as repository from '@/lib/api/repository';

const STAGING = 'abcdefghijklmnopqrst';
const urlFor = (ref: string) => ({ NEXT_PUBLIC_SUPABASE_URL: `https://${ref}.supabase.co` });

describe('staging seed guard', () => {
  it('allows a staging ref that NEXT_PUBLIC_SUPABASE_URL names', () => {
    expect(() => assertStagingTarget(STAGING, urlFor(STAGING))).not.toThrow();
  });

  it('refuses the production ref, whatever the URL says', () => {
    expect(PRODUCTION_REF).toBe('nzvepuzzxjoxvpcrlozx');
    expect(() => assertStagingTarget(PRODUCTION_REF, urlFor(PRODUCTION_REF))).toThrow(/production/);
    expect(() => assertStagingTarget(PRODUCTION_REF, urlFor(STAGING))).toThrow(/production/);
  });

  it('refuses when the URL points at production, even with a staging ref', () => {
    expect(() => assertStagingTarget(STAGING, { NEXT_PUBLIC_SUPABASE_URL: `https://${PRODUCTION_REF}.supabase.co/${STAGING}` })).toThrow(/production/);
  });

  it('refuses a missing or malformed ref, a missing URL, or a URL for another project', () => {
    expect(() => assertStagingTarget(undefined, urlFor(STAGING))).toThrow(/--ref/);
    expect(() => assertStagingTarget('short', urlFor('short'))).toThrow(/--ref/);
    expect(() => assertStagingTarget(STAGING, {})).toThrow(/not set/);
    expect(() => assertStagingTarget(STAGING, urlFor('zyxwvutsrqponmlkjihg'))).toThrow(/does not contain/);
    expect(() => assertStagingTarget(STAGING, { NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321' })).toThrow(/does not contain/);
  });

  it('the CLI exits non-zero for production before touching anything', () => {
    let failed = false;
    try {
      execFileSync('node', ['scripts/seed-staging.mjs', '--ref', PRODUCTION_REF], {
        env: { PATH: process.env.PATH, NODE_ENV: 'test', NEXT_PUBLIC_SUPABASE_URL: `https://${PRODUCTION_REF}.supabase.co` },
        stdio: 'pipe',
      });
    } catch (err) {
      failed = true;
      expect(String((err as { stderr: Buffer }).stderr)).toMatch(/Refusing to seed: that is the production project/);
    }
    expect(failed).toBe(true);
  });

  it('reads --ref and --pooler-host', () => {
    expect(parseArgs(['--ref', STAGING])).toMatchObject({ ref: STAGING });
    expect(parseArgs(['--ref', STAGING, '--pooler-host', 'h.example']).poolerHost).toBe('h.example');
  });

  it('loads no env file and keeps account passwords out of git', () => {
    const src = readFileSync('scripts/seed-staging.mjs', 'utf8');
    expect(src).not.toMatch(/from 'dotenv'|readFileSync\('\.env/);
    expect(src).not.toMatch(/rejectUnauthorized/);
    expect(readFileSync('.gitignore', 'utf8')).toContain(`/${ACCOUNTS_FILE}`);
    expect(readFileSync('scripts/seed-staging-data.mjs', 'utf8')).not.toMatch(/password\s*:/i);
  });
});

describe('staging seed dataset is fictional and covers the UAT cases', () => {
  const byOp = (k: string) => PACKAGES.filter((p) => p.op === k);
  const visible = PACKAGES.filter((p) => ['A', 'B', 'C', 'D'].includes(p.op) && p.status !== 'draft' && p.n !== 9);

  it('erased-name markers match the app', () => {
    expect(ERASED_NAME).toBe(repository.ERASED_NAME);
    expect(RETENTION_ERASED_NAME).toBe(repository.RETENTION_ERASED_NAME);
  });

  it('operators: names start with Test, ATOL 99001 to 99004 on A to D only, D is 60+ characters', () => {
    for (const o of OPERATORS) expect(o.companyName.startsWith('Test')).toBe(true);
    expect(OPERATORS.map((o) => [o.key, o.verification, o.atol])).toEqual([
      ['A', 'verified', '99001'], ['B', 'verified', '99002'], ['C', 'verified', '99003'], ['D', 'verified', '99004'],
      ['E', 'pending', null], ['F', 'verified', null],
    ]);
    expect(OPERATORS.find((o) => o.key === 'D')!.companyName.length).toBeGreaterThanOrEqual(60);
  });

  it('packages: about 30 under A to D, two each under E and F, one draft, one expired', () => {
    expect(['A', 'B', 'C', 'D'].reduce((n, k) => n + byOp(k).length, 0)).toBe(30);
    expect(byOp('E')).toHaveLength(2);
    expect(byOp('F')).toHaveLength(2);
    expect(PACKAGES.filter((p) => p.status === 'draft')).toHaveLength(1);
    const today = new Date().toISOString().slice(0, 10);
    expect(PACKAGES.filter((p) => p.dates && p.dates[1] < today).map((p) => p.n)).toEqual([9]);
  });

  it('covers every airport, length, star rating, distance band and the price range', () => {
    const airports = new Set(visible.map((p) => p.departureAirport ?? 'none'));
    expect([...airports].sort()).toEqual(['BHX', 'LGW', 'LHR', 'LTN', 'MAN', 'STN', 'none']);
    expect(new Set(visible.map((p) => p.nights[0]))).toEqual(new Set([7, 10, 14, 21]));
    for (const p of PACKAGES) expect(p.nights[1] + p.nights[2]).toBe(p.nights[0]);
    expect(new Set(visible.flatMap((p) => [p.stars?.[0] ?? null, p.stars?.[1] ?? null]))).toEqual(new Set([3, 4, 5, null]));
    expect(new Set(visible.flatMap((p) => p.bands))).toEqual(new Set(['near', 'medium', 'far', 'unknown']));
    const prices = visible.map((p) => p.price);
    expect([Math.min(...prices), Math.max(...prices)]).toEqual([699, 6950]);
    expect(prices.filter((x) => x === 1295)).toHaveLength(2);
    expect(visible.filter((p) => p.priceType === 'exact')).toHaveLength(1);
  });

  it('covers December 2026, Ramadan 2027, Easter 2027, summer 2027 and off-peak dates', () => {
    const months = visible.flatMap((p) => (p.dates ? [p.dates[0].slice(0, 7)] : []));
    for (const m of ['2026-12', '2027-02', '2027-03', '2027-07', '2027-08', '2026-11', '2027-05', '2027-10']) {
      expect(months).toContain(m);
    }
  });

  it('every package has a price date, some have no image, one has every optional field empty', () => {
    for (const p of PACKAGES) expect(p.updated).toMatch(/^2026-\d\d-\d\d$/);
    expect(visible.some((p) => !p.image)).toBe(true);
    expect(visible.some((p) => p.image)).toBe(true);
    const empty = PACKAGES.find((p) => p.n === 20)!;
    expect(Object.keys(empty).sort()).toEqual(['bands', 'inclusions', 'n', 'nights', 'op', 'price', 'rooms', 'title', 'updated']);
    expect(PACKAGES.some((p) => p.title.length > 120 && (p.hotelMakkahName ?? '').length > 60)).toBe(true);
  });

  it('inclusions and ziyarat mix yes, no and not stated', () => {
    expect(new Set(visible.flatMap((p) => Object.values(p.inclusions)))).toEqual(new Set([true, false, null]));
    expect(new Set(visible.map((p) => p.ziyarat ?? null))).toEqual(new Set([true, false, null]));
  });

  it('accounts, enquiries, leads and complaints', () => {
    expect(ACCOUNTS.map((a) => a.key)).toEqual(['admin', 'operatorA', 'operatorB', 'operatorE', 'customerWithEnquiries', 'customerNew']);
    for (const a of ACCOUNTS) expect(a.email).toMatch(/@test\.local$/);
    expect(ENQUIRIES).toHaveLength(12);
    const ops = new Set(ENQUIRIES.map((e) => PACKAGES.find((p) => p.n === e.pkg)!.op));
    expect(ops).toEqual(new Set(['A', 'B']));
    expect(new Set(ENQUIRIES.map((e) => e.state))).toEqual(new Set(['live', 'retention', 'erased']));
    expect(new Set(ENQUIRIES.map((e) => e.consent ?? null))).toEqual(new Set([true, false, null]));
    expect(new Set(LEADS.map((l) => l.status))).toEqual(new Set(['open', 'responded', 'closed']));
    expect(new Set(LEADS.flatMap((l) => (l.booking ? [l.booking] : [])))).toEqual(new Set(['started', 'contacted', 'confirmed', 'closed']));
    expect(COMPLAINTS.map((c) => c.status)).toEqual(['admin_triage', 'closed']);
  });

  it('ids carry the seed marker and are valid UUIDs', () => {
    const id = seedId('pkg', 30);
    expect(id.startsWith(SEED_ID_PREFIX)).toBe(true);
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('user-facing text has no em dashes, en dashes or semicolons', () => {
    const text = [
      ...OPERATORS.map((o) => o.companyName),
      ...PACKAGES.flatMap((p) => [p.title, p.hotelMakkahName, p.hotelMadinahName, p.cancellation, p.ziyaratDetails, roomPriceNote(p.roomPrices)]),
      ...ENQUIRIES.map((e) => e.message),
      ...COMPLAINTS.flatMap((c) => [c.description, c.operatorResponse, c.adminNotes]),
    ].filter(Boolean) as string[];
    for (const t of text) expect(t).not.toMatch(/[—–;]/);
  });

  it('room price notes and slugs', () => {
    expect(roomPriceNote([1295, 1395, 1595])).toBe('Room prices per person: Quad £1,295, Triple £1,395, Double £1,595.');
    expect(roomPriceNote([null, 6950, 7450])).toBe('Room prices per person: Triple £6,950, Double £7,450.');
    expect(roomPriceNote(undefined)).toBeNull();
    const slugs = PACKAGES.map((p) => slugify(p.n, p.title));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it('placeholder image is a valid PNG of the requested size', () => {
    const png = solidPng([1, 2, 3], 4, 2);
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(4);
    expect(png.readUInt32BE(20)).toBe(2);
    const idat = png.indexOf('IDAT');
    const raw = inflateSync(png.subarray(idat + 4, idat + 4 + png.readUInt32BE(idat - 4)));
    expect([...raw.subarray(0, 4)]).toEqual([0, 1, 2, 3]);
  });
});
