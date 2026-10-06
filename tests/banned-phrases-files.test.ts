import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { BANNED_METADATA_PHRASES } from '@/lib/content-rules';

// The older banned-phrases test checks a hand-copied list of strings; this one
// scans the real source of every user-facing surface (standards §5, §7).
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.tsx?$/.test(name) ? [full] : [];
  });

const EXTRA = ['vetted', 'endorsed', 'accredited'];
// '#1' is a metadata rule; in source it only matches hex colours (#111111).
const PHRASES = [...BANNED_METADATA_PHRASES.map((x) => x.toLowerCase()).filter((p) => p !== '#1'), ...EXTRA];
const SKIP = new Set([
  'lib/api/mock-db.ts', // test/E2E seed only, never served in production
  'components/operator/OperatorRegistrationForm.tsx', // PARKED self-serve onboarding (PARKED_FEATURES.md #3)
]);

describe('banned phrases never appear in live source files', () => {
  const files = [...walk('app'), ...walk('components'), ...walk('emails'), ...walk('lib')].filter(
    (f) => !f.includes('generated') && !f.endsWith('content-rules.ts') && !SKIP.has(f)
  );
  it('has no banned phrase anywhere', () => {
    const hits: string[] = [];
    for (const f of files) {
      const text = readFileSync(f, 'utf8').toLowerCase();
      for (const p of PHRASES) {
        // A question ("Is my package ATOL protected?") is not a claim.
        const claims = text.split(p).slice(1).filter((after) => !after.startsWith('?'));
        if (claims.length > 0) hits.push(`${f}: ${p}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
