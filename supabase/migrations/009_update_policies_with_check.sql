-- ═══════════════════════════════════════════════════════════════════════
-- 009 — Add WITH CHECK to all UPDATE policies
--
-- Without WITH CHECK, an authenticated user could UPDATE a row they own
-- and mutate the ownership field (operator_id / customer_id / id) to
-- another user's value, reassigning the record. WITH CHECK re-applies the
-- ownership predicate to the post-update row.
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════

-- ─── bank_change_requests ─────────────────────────────────────────────
DROP POLICY IF EXISTS "bank_change_requests_update_own_operator" ON bank_change_requests;
CREATE POLICY "bank_change_requests_update_own_operator" ON bank_change_requests
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = operator_id)
  WITH CHECK (auth.uid()::text = operator_id);

-- ─── booking_intents ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "booking_intents_update_own" ON booking_intents;
CREATE POLICY "booking_intents_update_own" ON booking_intents
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = customer_id OR auth.uid()::text = operator_id)
  WITH CHECK (auth.uid()::text = customer_id OR auth.uid()::text = operator_id);

-- ─── complaints ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "complaints_update_own_customer" ON complaints;
CREATE POLICY "complaints_update_own_customer" ON complaints
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = customer_id)
  WITH CHECK (auth.uid()::text = customer_id);

DROP POLICY IF EXISTS "complaints_update_own_operator" ON complaints;
CREATE POLICY "complaints_update_own_operator" ON complaints
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = operator_id)
  WITH CHECK (auth.uid()::text = operator_id);

-- ─── operator_profiles ────────────────────────────────────────────────
DROP POLICY IF EXISTS "operator_profiles_update_own" ON operator_profiles;
CREATE POLICY "operator_profiles_update_own" ON operator_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ─── packages ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "packages_update_own_operator" ON packages;
CREATE POLICY "packages_update_own_operator" ON packages
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = operator_id)
  WITH CHECK (auth.uid()::text = operator_id);

-- ─── users ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);
