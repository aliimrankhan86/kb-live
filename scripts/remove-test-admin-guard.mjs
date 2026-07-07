/**
 * Remove the synthetic admin@test.local account from PRODUCTION (auth + mirror).
 *
 * WHY THIS IS A SEPARATE, GUARDED SCRIPT
 * admin@test.local was the ONLY admin on prod for a long time. It is the
 * break-glass admin and must NOT be deleted until a real admin (a gmail
 * account) can log in. This script is intentionally dry-run by default and
 * refuses to remove the last admin, so it cannot lock you out.
 *
 * USAGE
 *   node scripts/remove-test-admin-guard.mjs             # DRY-RUN (default) — shows what would happen, no writes
 *   node scripts/remove-test-admin-guard.mjs --execute   # actually delete admin@test.local
 *
 * PRECONDITIONS (do these first)
 *   1. Verify you can log in to the LIVE site as aliimrankhan86@gmail.com and
 *      that it has admin access (role lives in app_metadata; log in fresh so
 *      the JWT carries the admin role).
 *   2. Only then run this with --execute.
 *
 * TARGET: this script uses .env.production.local if present (the prod creds),
 * otherwise .env.local. It prints the target project and whether it is prod.
 *
 * Modelled on scripts/create-test-users.mjs (env loading + service-role admin
 * client) and scripts/backfill-roles.mjs (app_metadata role reads).
 */

import { existsSync } from 'node:fs';
import { config } from 'dotenv';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const ENV_FILE = existsSync('.env.production.local') ? '.env.production.local' : '.env.local';
config({ path: ENV_FILE });

const TARGET_EMAIL = 'admin@test.local';
const EXPECTED_PROD_REF = 'nzvepuzzxjoxvpcrlozx';
const EXECUTE = process.argv.includes('--execute');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const directUrl = process.env.DIRECT_URL;

if (!url || !serviceKey || !directUrl) {
  console.error(`Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DIRECT_URL in ${ENV_FILE}`);
  process.exit(1);
}

const isProd = url.includes(EXPECTED_PROD_REF);

console.log('─'.repeat(64));
console.log(`env file       : ${ENV_FILE}`);
console.log(`target project : ${url}  (${isProd ? 'PROD' : 'NON-PROD'})`);
console.log(`target account : ${TARGET_EMAIL}`);
console.log(`mode           : ${EXECUTE ? '⚠️  EXECUTE (will delete)' : 'DRY-RUN (default, no writes)'}`);
console.log('─'.repeat(64));

const client = new pg.Client({ connectionString: directUrl });
await client.connect();
const q = async (sql, params = []) => (await client.query(sql, params)).rows;

try {
  // --- LOCKOUT GUARD: never remove the last admin --------------------------
  // Authorization role is app_metadata.role (the authz source of truth).
  const otherAdmins = await q(
    `select email from auth.users
       where raw_app_meta_data->>'role' = 'admin' and email <> $1
       order by email`,
    [TARGET_EMAIL]
  );
  console.log(`Other admins (app_metadata.role='admin'): ${otherAdmins.length}`);
  otherAdmins.forEach((r) => console.log(`   • ${r.email}`));
  if (otherAdmins.length === 0) {
    console.error(
      `\n✋ ABORT — ${TARGET_EMAIL} appears to be the only admin. Promote a real\n` +
      `   admin (e.g. a gmail account) and confirm you can log in as it BEFORE\n` +
      `   removing this account. Nothing was changed.`
    );
    process.exit(2);
  }

  // --- Resolve the target ---------------------------------------------------
  const authRow = await q(`select id, email from auth.users where email = $1`, [TARGET_EMAIL]);
  if (authRow.length === 0) {
    console.log(`\n✓ ${TARGET_EMAIL} is not present in auth.users — nothing to do.`);
    process.exit(0);
  }
  const id = authRow[0].id;
  const mirror = await q(`select id from public.users where id = $1`, [id]);
  console.log(`\nWould delete:`);
  console.log(`   auth.users     : 1 row (id=${id})`);
  console.log(`   public.users   : ${mirror.length} mirror row(s)`);

  if (!EXECUTE) {
    console.log(`\nDRY-RUN — no changes made. Re-run with --execute to delete.`);
    process.exit(0);
  }

  // --- EXECUTE --------------------------------------------------------------
  if (mirror.length > 0) {
    await q(`delete from public.users where id = $1`, [id]);
    console.log(`   deleted public.users mirror row`);
  }
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    console.error(`   ✋ auth deletion failed: ${error.message}`);
    process.exit(3);
  }
  console.log(`   deleted auth.users row`);

  const goneAuth = await q(`select count(*)::int n from auth.users where id = $1`, [id]);
  const goneMirror = await q(`select count(*)::int n from public.users where id = $1`, [id]);
  console.log(`\nAFTER: auth.users rows=${goneAuth[0].n}, public.users rows=${goneMirror[0].n}`);
  console.log(goneAuth[0].n === 0 ? `✓ ${TARGET_EMAIL} removed.` : `⚠️ still present — check manually.`);
} finally {
  await client.end();
}
