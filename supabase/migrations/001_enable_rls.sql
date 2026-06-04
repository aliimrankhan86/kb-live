-- ═══════════════════════════════════════════════════════════════════════
-- P1E-RLS-POLICIES — Row Level Security Policies
-- Deny-by-default. Every table has RLS enabled.
-- Admin bypasses via service role key (bypass_rls).
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Users ────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ─── Operator Profiles ────────────────────────────────────────────────
ALTER TABLE operator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "operator_profiles_read_public" ON operator_profiles
  FOR SELECT USING (true);

CREATE POLICY "operator_profiles_update_own" ON operator_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ─── Payment Details ──────────────────────────────────────────────────
ALTER TABLE payment_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_details_read_own_operator" ON payment_details
  FOR SELECT USING (auth.uid() = operator_id);

-- ─── Bank Change Requests ─────────────────────────────────────────────
ALTER TABLE bank_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bank_change_requests_read_own_operator" ON bank_change_requests
  FOR SELECT USING (auth.uid() = operator_id);

CREATE POLICY "bank_change_requests_insert_own_operator" ON bank_change_requests
  FOR INSERT WITH CHECK (auth.uid() = operator_id);

CREATE POLICY "bank_change_requests_update_own_operator" ON bank_change_requests
  FOR UPDATE USING (auth.uid() = operator_id);

-- ─── Audit Log Entries ────────────────────────────────────────────────
ALTER TABLE audit_log_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_read_own_operator" ON audit_log_entries
  FOR SELECT USING (auth.uid() = operator_id);

CREATE POLICY "audit_log_insert_system" ON audit_log_entries
  FOR INSERT WITH CHECK (true);

-- ─── Quote Requests ───────────────────────────────────────────────────
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quote_requests_read_own_customer" ON quote_requests
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "quote_requests_insert_own_customer" ON quote_requests
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- ─── Offers ───────────────────────────────────────────────────────────
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offers_read_all" ON offers
  FOR SELECT USING (true);

-- ─── Booking Intents ──────────────────────────────────────────────────
ALTER TABLE booking_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_intents_read_own_customer" ON booking_intents
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "booking_intents_read_own_operator" ON booking_intents
  FOR SELECT USING (auth.uid() = operator_id);

CREATE POLICY "booking_intents_insert_own_customer" ON booking_intents
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "booking_intents_update_own" ON booking_intents
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = operator_id);

-- ─── Packages ─────────────────────────────────────────────────────────
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_read_published" ON packages
  FOR SELECT USING (status = 'published');

CREATE POLICY "packages_read_own_operator" ON packages
  FOR SELECT USING (auth.uid() = operator_id);

CREATE POLICY "packages_insert_own_operator" ON packages
  FOR INSERT WITH CHECK (auth.uid() = operator_id);

CREATE POLICY "packages_update_own_operator" ON packages
  FOR UPDATE USING (auth.uid() = operator_id);

CREATE POLICY "packages_delete_own_operator" ON packages
  FOR DELETE USING (auth.uid() = operator_id);

-- ─── Complaints ───────────────────────────────────────────────────────
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "complaints_read_own_customer" ON complaints
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "complaints_read_own_operator" ON complaints
  FOR SELECT USING (auth.uid() = operator_id);

CREATE POLICY "complaints_insert_own_customer" ON complaints
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "complaints_update_own_operator" ON complaints
  FOR UPDATE USING (auth.uid() = operator_id);

CREATE POLICY "complaints_update_own_customer" ON complaints
  FOR UPDATE USING (auth.uid() = customer_id);