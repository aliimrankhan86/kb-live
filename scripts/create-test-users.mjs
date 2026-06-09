/**
 * One-time setup: create local test accounts in Supabase.
 * Run once: node scripts/create-test-users.mjs
 * Safe to re-run — skips accounts that already exist.
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

const TEST_USERS = [
  {
    email: 'customer@test.local',
    password: 'TestPass1!',
    role: 'customer',
    name: 'Test Customer',
  },
  {
    email: 'operator@test.local',
    password: 'TestPass1!',
    role: 'operator',
    name: 'Test Operator',
  },
  {
    email: 'admin@test.local',
    password: 'TestPass1!',
    role: 'admin',
    name: 'Test Admin',
  },
];

for (const u of TEST_USERS) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,          // skip email verification
    app_metadata: { role: u.role },
    user_metadata: { name: u.name },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already been registered') ||
        error.message.toLowerCase().includes('already exists')) {
      console.log(`  already exists — ${u.email} (${u.role})`);
    } else {
      console.error(`✗ ${u.email}: ${error.message}`);
    }
  } else {
    console.log(`✓ created  ${u.email}  role=${u.role}  id=${data.user.id}`);
  }
}

console.log('\nTest credentials:');
for (const u of TEST_USERS) {
  console.log(`  ${u.role.padEnd(9)} ${u.email}  /  ${u.password}`);
}
