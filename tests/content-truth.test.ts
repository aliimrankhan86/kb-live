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

describe('SEO and guide pages state no PilgrimCompare prices, dates, urgency or supply (standards §5, §6, §8, §11)', () => {
  const pages = [
    'app/umrah/page.tsx', 'app/umrah/london/page.tsx', 'app/umrah/birmingham/page.tsx', 'app/umrah/manchester/page.tsx',
    'app/umrah/ramadan/page.tsx', 'app/umrah/cost/page.tsx', 'app/hajj/page.tsx', 'components/marketing/CityCorridor.tsx',
    'lib/seo/corridor-faqs.ts',
  ];
  const text = (f: string) => readFileSync(f, 'utf8');
  it.each(pages)('%s has no hardcoded £ prices or % premiums', (f) => {
    expect(text(f)).not.toMatch(/£\s?\d|\d\s?[–-]\s?\d+%|\d+%\s/);
  });
  it.each(pages)('%s has no urgency, cheapest/lowest or blanket protection claims', (f) => {
    expect(text(f)).not.toMatch(/sell out|before packages|book(ing)? early|cheapest|lowest price|best value|ATOL or ABTA protect|must hold ATOL|protects your money|request a quote in minutes|flights included/i);
  });
  it('Ramadan page states no Ramadan dates of its own', () => {
    expect(text('app/umrah/ramadan/page.tsx')).not.toMatch(/\d{1,2} (February|March|April|May|June)|2027/);
  });
  it('city pages do not claim supply or airline routes', () => {
    for (const f of pages.slice(1, 4)) {
      expect(text(f)).not.toMatch(/direct (and connecting )?flights to Jeddah|charter|large Muslim community|lists verified operators who accept bookings/i);
    }
  });
});

describe('tier explanation claims only the §7 checks', () => {
  it('uses the verification statement and no enhanced-check or feedback claims', () => {
    const src = readFileSync('components/operators/TierExplanation.tsx', 'utf8');
    expect(src).toContain('VERIFICATION_STATEMENT');
    expect(src).not.toMatch(/customer feedback|trading history|ATOL or ABTA registration/);
  });
});
