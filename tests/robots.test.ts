import { describe, expect, it } from 'vitest';
import robots, { PRIVATE_PATHS } from '@/app/robots';

describe('robots.txt keeps private areas out of every crawler group', () => {
  it('each named group repeats the private disallows (named groups ignore *)', () => {
    const rules = robots().rules as { userAgent: string; disallow?: string[] }[];
    for (const r of rules) expect(r.disallow).toEqual(PRIVATE_PATHS);
    expect(PRIVATE_PATHS).toEqual(expect.arrayContaining(['/admin', '/operator', '/settings']));
  });
});
