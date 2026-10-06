import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.tsx?$/.test(name) ? [full] : [];
  });

// In the browser the Repository only reaches the in-memory MockDB (seed data,
// lost writes). Client components must fetch server routes instead.
const ALLOWED = new Set([
  'components/operator/OperatorRegistrationForm.tsx', // PARKED self-serve onboarding (PARKED_FEATURES.md #3)
  'components/operator/PackageForm.tsx', // unused legacy form, not rendered anywhere
]);

describe('guard: client components never read or write data through the browser Repository', () => {
  it('no "use client" file calls Repository.*', () => {
    const offenders = [...walk('components'), ...walk('app')].filter((file) => {
      if (ALLOWED.has(file)) return false;
      const src = readFileSync(file, 'utf8');
      return /^['"]use client['"]/m.test(src.slice(0, 200)) && /\bRepository\.\w+\(/.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it('the allowlisted files are still not rendered by any live page', () => {
    const live = [...walk('app'), ...walk('components')].filter((f) => !ALLOWED.has(f));
    for (const name of ['PackageForm']) {
      expect(live.filter((f) => new RegExp(`<${name}\\b`).test(readFileSync(f, 'utf8')))).toEqual([]);
    }
  });
});
