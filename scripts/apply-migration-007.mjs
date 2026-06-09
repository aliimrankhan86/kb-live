#!/usr/bin/env node
/**
 * Applies supabase/migrations/007_interests_table.sql to remote Supabase Postgres.
 * Idempotent: uses IF NOT EXISTS / DO NOTHING patterns.
 *
 * Usage: node scripts/apply-migration-007.mjs
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

const sqlPath = resolve(root, 'supabase/migrations/007_interests_table.sql');
const sql = readFileSync(sqlPath, 'utf8');

const client = new pg.Client({ connectionString });
await client.connect();

try {
  await client.query(sql);
  console.log('✓ Migration 007 applied (interests table)');

  const { rows } = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'interests' ORDER BY ordinal_position"
  );
  console.log('  Columns:', rows.map((r) => r.column_name).join(', '));
} finally {
  await client.end();
}
