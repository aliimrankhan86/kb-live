#!/usr/bin/env bash
# Prepares the LOCAL Supabase stack for the real-DB browser suite: schema,
# SQL migrations, the three *.test.local accounts and seeded LOCAL TEST DATA.
# Every run starts from an empty database (the SQL migrations are not
# re-runnable). Needs the stack started with:
#   supabase start --workdir e2e/local-db
# .env.local must point at 127.0.0.1: the seed refuses anything else.
set -euo pipefail
cd "$(dirname "$0")/../.."
supabase db reset --workdir e2e/local-db
npx prisma db push
for f in supabase/migrations/[0-9]*.sql; do npx prisma db execute --file "$f"; done
node scripts/create-test-users.mjs
node scripts/seed-local-test-data.mjs
