-- 013_operator_atol_abta_checked_at.sql
-- STATUS: WRITTEN, NOT APPLIED (founder instruction 2026-10-06). Kept outside
-- supabase/migrations/ so the "apply every file in order" procedure cannot run
-- it by accident. Move it into supabase/migrations/ and apply only on the
-- founder's go-ahead, then ship the follow-up code change below.
--
-- Records WHEN an admin checked an operator's ATOL number against the CAA
-- register and ABTA membership, so the package page can say
-- "checked against the CAA register on {date}" instead of
-- "(provided by the operator)". Additive, nullable, non-breaking, no backfill:
-- NULL = not checked yet (honest default; never inferred from verified_at).
-- RLS unchanged: inherits operator_profiles policies (migration 001). Run
-- PRODUCTION_CHECKS.sql query 1 first: if the API roles can UPDATE this table,
-- apply 014 before this file, or these columns would be operator-writable.
ALTER TABLE operator_profiles ADD COLUMN IF NOT EXISTS atol_verified_at timestamptz;
ALTER TABLE operator_profiles ADD COLUMN IF NOT EXISTS abta_verified_at timestamptz;

-- Follow-up code change AFTER applying (not before: Prisma would query columns
-- that do not exist yet):
--   prisma/schema.prisma OperatorProfile:
--     atolVerifiedAt DateTime? @map("atol_verified_at")
--     abtaVerifiedAt DateTime? @map("abta_verified_at")
--   lib/api/db/adapter.ts mapOperator: atolVerifiedAt/abtaVerifiedAt -> ISO strings;
--     saveOperator: write both (Repository.verifyOperatorAtol/Abta already set them).

-- Rollback:
--   ALTER TABLE operator_profiles DROP COLUMN IF EXISTS atol_verified_at, DROP COLUMN IF EXISTS abta_verified_at;
