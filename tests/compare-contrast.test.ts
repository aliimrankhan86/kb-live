import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// UX-07: rows where every package has the same value are dimmed, but must stay
// readable: at least 4.5:1 (WCAG 2.2 AA) on every background they sit on.
const css = readFileSync('styles/tokens.css', 'utf8');
const block = (selector: string) => css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)));
const token = (b: string, name: string) => b.match(new RegExp(`--${name}:\\s*([^;]+);`))![1].trim();

type RGBA = [number, number, number, number];
const parse = (v: string): RGBA => {
  if (v.startsWith('#')) return [0, 2, 4].map((i) => parseInt(v.slice(1 + i, 3 + i), 16)).concat(1) as RGBA;
  const [r, g, b, a = 1] = v.match(/[\d.]+/g)!.map(Number);
  return [r, g, b, a];
};
const over = ([r, g, b, a]: RGBA, [R, G, B]: RGBA): RGBA => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
const lum = ([r, g, b]: RGBA) =>
  [r, g, b].map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; })
    .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a: RGBA, b: RGBA) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

describe.each([
  ['dark', block(':root {'), block(':root {')],
  ['light', block('[data-theme="light"]'), block(':root {')],
])('identical comparison rows on the %s theme', (_name, theme, root) => {
  const get = (n: string) => (theme.includes(`--${n}:`) ? token(theme, n) : token(root, n));
  it('meet 4.5:1 on plain, striped and lowest-price backgrounds', () => {
    const surface = parse(get('surfaceDark'));
    const even = parse(get('comparison-even-bg'));
    for (const base of [surface, even]) {
      for (const bg of [base, over(parse(get('comparison-lowest-bg')), base)]) {
        expect(ratio(over(parse(get('comparison-dim-text')), bg), bg)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
