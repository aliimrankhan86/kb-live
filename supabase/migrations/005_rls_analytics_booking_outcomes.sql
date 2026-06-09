-- ═══════════════════════════════════════════════════════════════════════
-- 005 — RLS for analytics_events + booking_outcomes
--
-- These two tables were added after 001 (analytics in the operator-analytics
-- work, booking_outcomes in the outcome-reporting work) via `prisma db push`,
-- which does NOT create RLS policies. They were therefore the only app tables
-- left without RLS — a deny-by-default gap.
--
-- App writes go through Prisma over a direct Postgres connection, which runs as
-- the table owner and bypasses RLS. So these policies do not affect the app's
-- own writes/reads; they are defense-in-depth for any access via the Supabase
-- Data API (PostgREST) using anon/authenticated keys: deny-by-default with
-- owner/admin read only, and no client write path.
--
-- Admin is identified via the JWT app_metadata.role claim (the trusted role
-- source — see lib/auth/api.ts). Predicate style mirrors 001 (auth.uid() = col).
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════

-- ─── analytics_events ─────────────────────────────────────────────────
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_events_read_own_operator" ON analytics_events;
CREATE POLICY "analytics_events_read_own_operator" ON analytics_events
  FOR SELECT TO authenticated
  USING (auth.uid()::text = operator_id);

DROP POLICY IF EXISTS "analytics_events_read_admin" ON analytics_events;
CREATE POLICY "analytics_events_read_admin" ON analytics_events
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
-- No INSERT/UPDATE/DELETE policy: events are written server-side only.

-- ─── booking_outcomes ─────────────────────────────────────────────────
ALTER TABLE booking_outcomes ENABLE ROW LEVEL SECURITY;

-- The customer or operator party to the linked booking may read its outcome.
DROP POLICY IF EXISTS "booking_outcomes_read_involved" ON booking_outcomes;
CREATE POLICY "booking_outcomes_read_involved" ON booking_outcomes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM booking_intents bi
      WHERE bi.id = booking_outcomes.booking_intent_id
        AND (auth.uid()::text = bi.customer_id OR auth.uid()::text = bi.operator_id)
    )
  );

DROP POLICY IF EXISTS "booking_outcomes_read_admin" ON booking_outcomes;
CREATE POLICY "booking_outcomes_read_admin" ON booking_outcomes
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
-- No write policies: outcomes are written server-side via Prisma only.
