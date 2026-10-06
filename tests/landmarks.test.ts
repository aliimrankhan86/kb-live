import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.tsx$/.test(name) ? [full] : [];
  });

describe('one <main> landmark per page (WCAG 1.3.1 / 2.4.1)', () => {
  it('only the root layout renders <main>; pages and components never nest another', () => {
    const offenders = [...walk('app'), ...walk('components')]
      .filter((f) => f !== 'app/layout.tsx')
      .filter((f) => /<main[\s>]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
    expect(readFileSync('app/layout.tsx', 'utf8')).toMatch(/<main id="main-content"/);
  });
});
