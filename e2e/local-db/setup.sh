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
# Pending migration 015 (item 9 room prices), not yet applied to staging or
# production: run it here so every local run proves it applies cleanly on top
# of the schema (IF NOT EXISTS: the Prisma schema already has the columns).
npx prisma db execute --file supabase/migrations-pending/015_package_room_prices.sql
node scripts/create-test-users.mjs
node scripts/seed-local-test-data.mjs
