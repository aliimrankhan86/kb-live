/**
 * READ-ONLY: count auth users by app_metadata.role. No writes.
 * Run: node scripts/count-roles.mjs
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

const byRole = new Map();
let absent = 0;
for (const u of all) {
  const role = u.app_metadata?.role;
  if (role === undefined || role === null || role === '') {
    absent++;
  } else {
    byRole.set(role, (byRole.get(role) ?? 0) + 1);
  }
}

console.log('total users:', all.length);
console.log('users WITH app_metadata.role set:');
for (const [role, n] of [...byRole.entries()].sort()) {
  console.log(`  ${role}: ${n}`);
}
console.log('distinct role values present:', [...byRole.keys()].sort().join(', ') || '(none)');
console.log('users with NO app_metadata.role:', absent);
