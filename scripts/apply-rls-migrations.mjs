#!/usr/bin/env node
/**
 * Applies the row-level-security migrations to the remote Supabase Postgres via
 * DIRECT_URL (non-pooled — required for DDL). Each migration runs in its own
 * transaction (ROLLBACK on error, so a failure leaves no partial state).
 *
 * Migrations applied (in order):
 *   001_enable_rls.sql                       — RLS + policies for the 10 core tables
 *   005_rls_analytics_booking_outcomes.sql   — RLS for the 2 tables added later
 *   006_payment_evidence_operator_admin_read.sql — operator/admin read on evidence
 *
 * All migrations are idempotent (DROP POLICY IF EXISTS + ENABLE RLS no-op), so
 * re-running is safe.
 *
 * Usage: node scripts/apply-rls-migrations.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
loadEnv({ path: resolve(root, '.env.local') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('✗ DIRECT_URL / DATABASE_URL not found in .env.local');
  process.exit(1);
}

const MIGRATIONS = [
  '001_enable_rls.sql',
  '005_rls_analytics_booking_outcomes.sql',
  '006_payment_evidence_operator_admin_read.sql',
];

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log('• Connected to', connectionString.replace(/:\/\/[^@]*@/, '://***@'));

  for (const file of MIGRATIONS) {
    const sql = readFileSync(resolve(root, 'supabase/migrations', file), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✓ Applied ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`✗ ${file} rolled back: ${err.message}`);
      throw err;
    }
  }

  // ── Verify RLS is enabled on every app table ──────────────────────────────
  const rls = await client.query(
    `SELECT relname, relrowsecurity FROM pg_class
      WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
      ORDER BY relname`
  );
  const off = rls.rows.filter((r) => !r.relrowsecurity).map((r) => r.relname);
  console.log('\n=== RLS status ===');
  for (const r of rls.rows) console.log(`${r.relrowsecurity ? 'RLS ' : 'NO  '}${r.relname}`);
  if (off.length) throw new Error('tables still without RLS: ' + off.join(', '));

  console.log('\n✅ RLS enabled on all public tables.');
}

main()
  .catch((err) => {
    console.error('✗ FAILED:', err.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
