import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.(tsx?|md)$/.test(name) ? [full] : [];
  });
const liveFiles = () => [...walk('app'), ...walk('components'), ...walk('emails')];

const ENV = { ...process.env };
afterEach(() => { process.env = { ...ENV }; });

describe('no fabricated operators, testimonials or reviews in live code (standards §9, truth rule 1)', () => {
  it('no real-sounding demo operator names, ATOL numbers or hotel brands', () => {
    const hits = liveFiles().filter((f) => /Al-Hidayah|al-hidayah|ATOL:? 11234|Swissotel|Hilton Suites/.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });

  it('no testimonial components', () => {
    expect(liveFiles().filter((f) => /testimonial/i.test(f))).toEqual([]);
  });
});

describe('/showcase (sample-data playground) is never served on the live site', () => {
  it('404s on Vercel production', async () => {
    process.env.VERCEL_ENV = 'production';
    const { default: ShowcasePage } = await import('@/app/showcase/page');
    expect(() => ShowcasePage()).toThrow();
  });
});

describe('/partner makes only supported claims (standards §5, §7; Direction §5)', () => {
  const src = () => readFileSync('app/partner/page.tsx', 'utf8');
  it.each([/Thousands/i, /commission/i, /already listing/i, /\bpartner\?/i, /comparison platform/i, /ranking is affected/i, /ATOL-protected/i, /financial protection status/i])(
    'does not say %s',
    (re) => expect(src()).not.toMatch(re)
  );
  it('uses the approved verification statement', () => {
    expect(src()).toContain('{VERIFICATION_STATEMENT}');
  });
});
