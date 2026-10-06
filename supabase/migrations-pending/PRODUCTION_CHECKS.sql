-- PRODUCTION_CHECKS.sql: READ ONLY. Nothing here changes data, grants or policies.
-- Run in the Supabase SQL editor (production project) by Ali, or by Claude in
-- Chrome only on Ali's explicit instruction in that session, with each query
-- copied verbatim from the release doc (docs/release/). No other agent runs it.
-- Not a migration: kept outside supabase/migrations/.
--
-- The SQL editor shows only the LAST result, so highlight ONE query at a time
-- and press Run.
--
-- Why: the app writes operator_profiles only through Prisma (server, postgres
-- role). PilgrimCompare lists an operator publicly when verification_status =
-- 'verified' and it has an ATOL number. If the API roles (anon,
-- authenticated) hold UPDATE on operator_profiles, a signed-in operator could
-- call the Supabase REST API directly and set its own row to 'verified', since
-- policy operator_profiles_update_own (migration 009) allows every column of
-- its own row.

-- ── Query 1: can the API roles touch the verification fields? ──────────────
-- Expected: every row says PASS. Any FAIL: apply
-- supabase/migrations-pending/014_revoke_api_role_writes_operator_profiles.sql
-- (after review), then rerun this query.
SELECT c.check_name,
       c.allowed,
       CASE WHEN c.allowed THEN 'FAIL' ELSE 'PASS' END AS result
FROM (
  SELECT format('%s can UPDATE operator_profiles.%s', r.role, col.name) AS check_name,
         has_column_privilege(r.role, 'public.operator_profiles', col.name, 'UPDATE') AS allowed
  FROM (VALUES ('authenticated'), ('anon')) AS r(role)
  CROSS JOIN (
    SELECT column_name::text AS name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'operator_profiles'
      AND column_name IN ('verification_status', 'verified_at', 'tier', 'can_receive_bookings',
                          'payment_sla_flagged', 'onboarding_complete', 'bank_details_active',
                          'atol_number', 'abta_member_number', 'atol_verified_at', 'abta_verified_at', 'slug')
  ) AS col
  UNION ALL
  SELECT format('%s can %s operator_profiles', r.role, p.priv),
         has_table_privilege(r.role, 'public.operator_profiles', p.priv)
  FROM (VALUES ('authenticated'), ('anon')) AS r(role)
  CROSS JOIN (VALUES ('INSERT'), ('UPDATE'), ('DELETE'), ('SELECT'), ('TRUNCATE')) AS p(priv)
) AS c
ORDER BY result, c.check_name;

-- ── Query 2: row level security on every table ───────────────────────────
-- Expected: rls_enabled = true for every table in public. A false row is a
-- table the API roles can read or write without any policy check.
SELECT n.nspname AS schema, c.relname AS table_name,
       c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced,
       (SELECT count(*) FROM pg_policies p WHERE p.schemaname = n.nspname AND p.tablename = c.relname) AS policy_count,
       has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
       has_table_privilege('authenticated', c.oid, 'UPDATE') AS authenticated_update
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname IN ('public', 'storage') AND c.relkind IN ('r', 'p')
ORDER BY c.relrowsecurity, n.nspname, c.relname;

-- ── Query 3: every row level security policy ─────────────────────────────
-- Compare with supabase/migrations/001, 005, 006, 008, 009, 010, 011. A policy
-- in production that is not in those files was added by hand.
SELECT schemaname, tablename, policyname, permissive, roles, cmd,
       qual AS using_expression, with_check
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, policyname;

-- ── Query 4: verified operators that the ATOL rule now hides ──────────────
-- Returns one number only. Public pages list an operator only when it is
-- verified AND has an ATOL number, so every operator counted here disappears
-- from public pages on release. Expected: 0, or a number you have accepted.
SELECT count(*) AS verified_without_atol
FROM public.operator_profiles
WHERE verification_status = 'verified'
  AND (atol_number IS NULL OR btrim(atol_number) = '');

-- ── Supabase dashboard: Authentication > URL Configuration ───────────────
-- Not SQL. Check these by eye. The app only ever sends people back to
-- /auth/confirm (sign-up confirmation and password reset, with ?next=...).
--   Site URL:          https://pilgrimcompare.co.uk
--   Redirect URLs:     https://pilgrimcompare.co.uk/auth/confirm**
--   Previews (only if previews must send auth emails): the exact preview
--   host, e.g. https://<project>-<team-slug>.vercel.app/auth/confirm**,
--   scoped to YOUR team slug.
-- Must NOT be present: https://*.vercel.app/** or any entry ending in /**
-- on a host you do not own. Any Vercel user can host a page on *.vercel.app
-- and would then receive a victim's password reset code.
-- localhost / 127.0.0.1 entries belong only in the local stack's config.toml.
