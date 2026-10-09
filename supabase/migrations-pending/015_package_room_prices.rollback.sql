-- 015_package_room_prices.rollback.sql
-- Rollback for 015_package_room_prices.sql. NOT APPLIED anywhere.
--
-- ORDER: first deploy code that does not read these columns (the release
-- before batch 2), then run this file. Running it while the batch 2 code is
-- live makes every package query fail.
--
-- This DROPS any room prices operators have stated since 015 was applied.
-- Export them first if they must be kept:
--   SELECT id, price_quad_per_person, price_triple_per_person, price_double_per_person
--   FROM packages
--   WHERE price_quad_per_person IS NOT NULL OR price_triple_per_person IS NOT NULL OR price_double_per_person IS NOT NULL;

ALTER TABLE packages DROP COLUMN IF EXISTS price_quad_per_person;
ALTER TABLE packages DROP COLUMN IF EXISTS price_triple_per_person;
ALTER TABLE packages DROP COLUMN IF EXISTS price_double_per_person;
