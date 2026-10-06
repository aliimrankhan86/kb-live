import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

// PRODUCTION_CHECKS.sql is run by hand in the production SQL editor, so it
// must never contain a statement that changes anything.
const code = (path: string) => readFileSync(path, 'utf8').replace(/--.*$/gm, '').replace(/'[^']*'/g, "''");

describe('production checks are read only; the fix stays pending', () => {
  it('PRODUCTION_CHECKS.sql has only SELECT statements', () => {
    const sql = code('supabase/migrations-pending/PRODUCTION_CHECKS.sql');
    expect(sql).not.toMatch(/\b(INSERT|UPDATE\s+\w+\s+SET|DELETE\s+FROM|ALTER|GRANT|REVOKE|CREATE|DROP|TRUNCATE|COMMENT\s+ON)\b/i);
    expect(sql.match(/\bSELECT\b/gi)?.length).toBeGreaterThanOrEqual(3);
    expect(sql).toContain('has_column_privilege(r.role');
    expect(sql).toContain('FROM pg_policies');
  });

  it('query 1 also checks TRUNCATE and bank_details_active', () => {
    const raw = readFileSync('supabase/migrations-pending/PRODUCTION_CHECKS.sql', 'utf8');
    expect(raw).toMatch(/VALUES \('INSERT'\), \('UPDATE'\), \('DELETE'\), \('SELECT'\), \('TRUNCATE'\)/);
    expect(raw).toContain("'bank_details_active'");
  });

  it('has a read-only count of verified operators with no ATOL number, and returns nothing else', () => {
    const sql = code('supabase/migrations-pending/PRODUCTION_CHECKS.sql');
    expect(sql).toMatch(/SELECT count\(\*\) AS verified_without_atol\s+FROM public\.operator_profiles\s+WHERE verification_status = ''\s+AND \(atol_number IS NULL OR btrim\(atol_number\) = ''\);/);
  });

  it('the grant fix (014) is written but not in the auto-applied migrations folder', () => {
    expect(code('supabase/migrations-pending/014_revoke_api_role_writes_operator_profiles.sql'))
      .toMatch(/REVOKE ALL ON public\.operator_profiles FROM anon, authenticated;/);
    expect(existsSync('supabase/migrations/014_revoke_api_role_writes_operator_profiles.sql')).toBe(false);
  });
});
