import { afterEach, describe, expect, it, vi } from 'vitest';
import robots, { PRIVATE_PATHS } from '@/app/robots';
import nextConfig from '../next.config';

const NON_PRODUCTION = ['preview', 'development', '', undefined];

async function headerKeys() {
  const routes = await nextConfig.headers!();
  return routes.flatMap((r) => r.headers);
}

afterEach(() => vi.unstubAllEnvs());

describe('robots.txt keeps private areas out of every crawler group', () => {
  it('each named group repeats the private disallows (named groups ignore *)', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    const rules = robots().rules as { userAgent: string; disallow?: string[] }[];
    expect(rules.map((r) => r.userAgent)).toEqual(['*', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']);
    for (const r of rules) expect(r.disallow).toEqual(PRIVATE_PATHS);
    expect(PRIVATE_PATHS).toEqual(expect.arrayContaining(['/admin', '/operator', '/settings']));
    expect(robots().sitemap).toBe('https://pilgrimcompare.co.uk/sitemap.xml');
  });

  it.each(NON_PRODUCTION)('VERCEL_ENV=%s disallows everything', (env) => {
    vi.stubEnv('VERCEL_ENV', env);
    expect(robots()).toEqual({ rules: [{ userAgent: '*', disallow: '/' }] });
  });
});

describe('X-Robots-Tag', () => {
  it('is absent in production (headers unchanged)', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    expect((await headerKeys()).map((h) => h.key)).toEqual([
      'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Strict-Transport-Security',
    ]);
  });

  it.each(NON_PRODUCTION)('is noindex, nofollow on every route outside production (VERCEL_ENV=%s)', async (env) => {
    vi.stubEnv('VERCEL_ENV', env);
    const routes = await nextConfig.headers!();
    expect(routes.map((r) => r.source)).toEqual(['/(.*)']);
    expect(await headerKeys()).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex, nofollow' });
  });
});
