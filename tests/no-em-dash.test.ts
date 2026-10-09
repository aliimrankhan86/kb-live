import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Standards §11: no em dashes in user-facing copy, and (batch 1) no en dashes
// either: ranges read "1 to 2". Batch 3: comments too, and the demo seed data
// that renders on a page when used (prisma/seed.ts, supabase/seed.sql).
const walk = (dir: string): string[] =>
  dir === join('lib', 'generated') // Prisma output, gitignored and regenerated
    ? []
    : readdirSync(dir).flatMap((name) => {
        const full = join(dir, name);
        return statSync(full).isDirectory() ? walk(full) : /\.(tsx?|css|sql|mjs|json)$/.test(name) ? [full] : [];
      });

const FILES = [
  ...['app', 'components', 'emails', 'lib', 'hooks', 'styles'].flatMap(walk),
  'middleware.ts', 'next.config.ts', 'prisma.config.ts', 'prisma/seed.ts', 'supabase/seed.sql',
];

describe('no em or en dashes in shipped source', () => {
  it('copy, comments and demo seed data', () => {
    const hits: string[] = [];
    for (const f of FILES) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        if (/[—–]/.test(line)) hits.push(`${f}:${i + 1}: ${line.trim()}`);
      });
    }
    expect(FILES.length).toBeGreaterThan(250);
    expect(hits).toEqual([]);
  });
});
