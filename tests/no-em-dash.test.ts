import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Standards §11: no em dashes in user-facing copy, and (batch 1) no en dashes
// either: ranges read "1 to 2". Comment lines are ignored.
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.tsx?$/.test(name) ? [full] : [];
  });

const isComment = (line: string) => /^\s*(\/\/|\/?\*|\{\s*\/\*)/.test(line);

describe('no em or en dashes in user-facing source', () => {
  it('app, components, emails and lib', () => {
    const hits: string[] = [];
    let inBlock = false;
    for (const f of [...walk('app'), ...walk('components'), ...walk('emails'), ...walk('lib')]) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        if (line.includes('/*') && !line.includes('*/')) inBlock = true;
        const skip = inBlock || isComment(line);
        if (line.includes('*/')) inBlock = false;
        const code = line.replace(/\/\/.*$/, '').replace(/\{\/\*.*?\*\/\}/g, '').replace(/\/\*.*?\*\//g, '');
        if (!skip && /[—–]/.test(code)) hits.push(`${f}:${i + 1}`);
      });
    }
    expect(hits).toEqual([]);
  });
});
