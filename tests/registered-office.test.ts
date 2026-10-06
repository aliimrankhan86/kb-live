import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { REGISTERED_OFFICE, registeredOfficeClause } from '@/lib/legal';

describe('registered office (standards §2): one config value, never invented', () => {
  it('is unset until the founder provides it, so nothing is shown', () => {
    expect(REGISTERED_OFFICE).toBeUndefined();
    expect(registeredOfficeClause()).toBe('');
  });

  it('shows exactly the configured address once set', () => {
    expect(registeredOfficeClause('  1 Example Street, London  ')).toBe(', registered office 1 Example Street, London');
    expect(registeredOfficeClause('   ')).toBe('');
  });

  it('footer, Terms and Privacy read it only from the config value', () => {
    for (const f of ['components/layout/Footer.tsx', 'app/terms/page.tsx', 'app/privacy/page.tsx']) {
      const src = readFileSync(f, 'utf8');
      expect(src).toContain('registeredOfficeClause()');
      expect(src).not.toMatch(/registered office [A-Z0-9]/);
    }
  });
});
