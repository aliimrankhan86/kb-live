-- 015_package_room_prices.sql
-- STATUS: WRITTEN, NOT APPLIED. Not applied to staging or production. Kept
-- outside supabase/migrations/ so the "apply every file in order" procedure
-- cannot run it by accident. Applied only to the local test database.
--
-- Item 9 / UX-11: optional operator-stated price per person by room type
-- (quad, triple, double occupancy). Same convention as price_per_person:
-- numeric(10,2), the package's own currency (GBP), never converted.
-- Additive and nullable: no default, no backfill, no data change.
--   NULL = not stated (renders "Not provided"); never zero.
-- The headline price (price_per_person) is unchanged. RLS is unchanged: the
-- columns inherit the existing packages table policies (migration 001).
--
-- Safe on a live table: ADD COLUMN with no default is a catalogue-only change
-- in Postgres 11 and later (no table rewrite, brief ACCESS EXCLUSIVE lock).
--
-- DEPLOY ORDER (the new code reads these columns; every package query fails
-- until they exist):
--   1. Staging: apply this file to the staging project, then check the PR
--      preview.
--   2. Production: apply this file BEFORE the code that reads it is released
--      to main.
--   3. Then deploy the code.
-- Rollback: 015_package_room_prices.rollback.sql (deploy the previous code
-- first, then drop the columns).

ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_quad_per_person   numeric(10,2);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_triple_per_person numeric(10,2);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_double_per_person numeric(10,2);

-- Check (read-only): expect 3 rows, numeric, precision 10, scale 2, nullable YES.
-- SELECT column_name, data_type, numeric_precision, numeric_scale, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'packages'
--   AND column_name IN ('price_quad_per_person', 'price_triple_per_person', 'price_double_per_person')
-- ORDER BY column_name;
