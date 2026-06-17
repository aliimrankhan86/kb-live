-- 012_package_ziyarat_fields.sql
-- Adds operator-stated Ziyarat fields to the packages table.
-- Additive, nullable, non-breaking (no backfill, no default).
--   ziyarat_included: NULL = not stated (renders "Not provided");
--                     true = Included; false = operator stated NOT included.
--   ziyarat_details:  NULL = not stated.
-- RLS unchanged — inherits the existing packages table policies (migration 001).
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ziyarat_included boolean;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS ziyarat_details  text;
