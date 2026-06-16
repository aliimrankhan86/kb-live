/**
 * One-off, IDEMPOTENT role backfill.
 *
 * Sets app_metadata.role = 'customer' ONLY for auth users that currently have
 * NO role set. Users that already carry any role value (customer/operator/admin
 * or anything else) are left exactly as-is.
 *
 * app_metadata is MERGED, never replaced: existing keys on each user are read
 * and preserved; only `role` is added. No other app_metadata key is dropped or
 * overwritten.
 *
 * Idempotent + safe to re-run: a second run finds 0 missing-role users and
 * changes nothing.
 *
 * ENVIRONMENT: writes to whatever Supabase project the SUPABASE_SERVICE_ROLE_KEY
 * in .env.local belongs to. Point it at the correct environment before running.
 * Service-role only — never expose this key client-side.
 *
 * Run: node scripts/backfill-roles.mjs
 * Verify independently with: node scripts/count-roles.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Page through every auth user.
const all = [];
let page = 1;
const perPage = 1000;
for (;;) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
  if (error) { console.error('listUsers error:', error.message); process.exit(1); }
  all.push(...data.users);
  if (data.users.length < perPage) break;
  page++;
}

let updated = 0;
let skipped = 0;
for (const u of all) {
  const role = u.app_metadata?.role;
  const hasRole = !(role === undefined || role === null || role === '');
  if (hasRole) {
    skipped++;
    continue;
  }
  // MERGE: preserve every existing app_metadata key, add role only.
  const merged = { ...(u.app_metadata ?? {}), role: 'customer' };
  const { error } = await supabase.auth.admin.updateUserById(u.id, {
    app_metadata: merged,
  });
  if (error) {
    console.error(`✗ ${u.email} (${u.id}): ${error.message}`);
    continue;
  }
  console.log(`✓ backfilled role=customer  ${u.email}  ${u.id}`);
  updated++;
}

// Post-run breakdown (re-derived from a fresh fetch so the numbers are real).
const after = [];
page = 1;
for (;;) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
  if (error) { console.error('listUsers (post) error:', error.message); process.exit(1); }
  after.push(...data.users);
  if (data.users.length < perPage) break;
  page++;
}
const byRole = new Map();
let absent = 0;
for (const u of after) {
  const role = u.app_metadata?.role;
  if (role === undefined || role === null || role === '') absent++;
  else byRole.set(role, (byRole.get(role) ?? 0) + 1);
}

console.log('\n--- summary ---');
console.log('total users:', all.length);
console.log('updated:', updated);
console.log('skipped (already had a role):', skipped);
console.log('post-run role breakdown:');
for (const [role, n] of [...byRole.entries()].sort()) {
  console.log(`  ${role}: ${n}`);
}
console.log('post-run users with NO role:', absent);
