import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// Every store() method the Repository calls must exist on the Prisma DBAdapter;
// otherwise the call works in tests (MockDB) and throws in production.
describe('DBAdapter implements every store method the Repository uses', () => {
  it('has no missing methods', () => {
    const repo = readFileSync('lib/api/repository.ts', 'utf8');
    const adapter = readFileSync('lib/api/db/adapter.ts', 'utf8');
    const used = [...new Set([...repo.matchAll(/store\(\)\.(\w+)/g)].map((m) => m[1]))];
    const missing = used.filter((m) => !new RegExp(`^  ${m}:`, 'm').test(adapter));
    expect(missing).toEqual([]);
  });
});
