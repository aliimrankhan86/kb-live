import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// UX-24: nothing on the site is set below 12px (0.75rem).
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.(css|tsx)$/.test(name) ? [full] : [];
  });

const toPx = (value: string, unit: string) => Number(value) * (unit === 'px' ? 1 : 16);

describe('minimum text size', () => {
  it('no font-size or text-[...] below 12px in app, components and styles', () => {
    const hits: string[] = [];
    for (const f of [...walk('app'), ...walk('components'), ...walk('styles')]) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        for (const m of line.matchAll(/(?:font-size:\s*|text-\[)(\d*\.?\d+)(px|rem)\b/g)) {
          if (toPx(m[1], m[2]) < 12) hits.push(`${f}:${i + 1} ${m[0]}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });
});
