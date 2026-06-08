#!/usr/bin/env node
/**
 * One-off runner: applies supabase/migrations/004_package_images_bucket.sql
 * to the remote Supabase Postgres via DIRECT_URL (non-pooled — required for DDL).
 *
 * Idempotent: the migration uses ON CONFLICT DO UPDATE + DROP POLICY IF EXISTS,
 * so re-running is safe. After applying, verifies bucket + the 4 RLS policies.
 *
 * Usage: node scripts/apply-migration-004.mjs
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

const sqlPath = resolve(root, 'supabase/migrations/004_package_images_bucket.sql');
const sql = readFileSync(sqlPath, 'utf8');

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log('• Connected to', connectionString.replace(/:\/\/[^@]*@/, '://***@'));

  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✓ Migration 004 applied (committed)');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }

  // ── Verify ──────────────────────────────────────────────────────────────
  const bucket = await client.query(
    `SELECT id, public, file_size_limit, allowed_mime_types
       FROM storage.buckets WHERE id = 'package-images'`
  );
  if (bucket.rowCount !== 1) throw new Error('bucket package-images not found after apply');
  console.log('✓ Bucket:', JSON.stringify(bucket.rows[0]));

  const policies = await client.query(
    `SELECT policyname FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND policyname LIKE 'package_images_%'
      ORDER BY policyname`
  );
  const names = policies.rows.map((r) => r.policyname);
  const expected = [
    'package_images_delete_own',
    'package_images_insert_own',
    'package_images_select_public',
    'package_images_update_own',
  ];
  const missing = expected.filter((e) => !names.includes(e));
  if (missing.length) throw new Error('missing RLS policies: ' + missing.join(', '));
  console.log('✓ RLS policies (4):', names.join(', '));

  console.log('\n✅ Migration 004 verified end-to-end.');
}

main()
  .catch((err) => {
    console.error('✗ FAILED:', err.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
