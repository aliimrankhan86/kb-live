-- ═══════════════════════════════════════════════════════════════════════
-- P1E-RLS-POLICIES — Row Level Security Policies
-- Deny-by-default. Every table has RLS enabled.
-- Admin/service role bypasses RLS (the app reads/writes via Prisma over a
-- direct Postgres connection that runs as the table owner and bypasses RLS).
--
-- IMPORTANT — type note: the id / *_id columns are Postgres `text` (Prisma
-- `String @default(uuid())` maps to text). `auth.uid()` returns `uuid`, so every
-- ownership predicate casts `auth.uid()::text` to avoid an `operator does not
-- exist: uuid = text` error. (The original migration omitted the cast, which is
-- why it failed to apply and core tables shipped with NO row-level security.)
--
-- Idempotent: DROP POLICY IF EXISTS before each CREATE; ENABLE RLS is a no-op if
-- already enabled. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Users ────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own" ON users
  FOR SELECT TO authenticated USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated USING (auth.uid()::text = id);

-- ─── Operator Profiles ────────────────────────────────────────────────
ALTER TABLE operator_profiles ENABLE ROW LEVEL SECURITY;

-- Public profiles are intentionally world-readable.
DROP POLICY IF EXISTS "operator_profiles_read_public" ON operator_profiles;
CREATE POLICY "operator_profiles_read_public" ON operator_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "operator_profiles_update_own" ON operator_profiles;
CREATE POLICY "operator_profiles_update_own" ON operator_profiles
  FOR UPDATE TO authenticated USING (auth.uid()::text = id);

-- ─── Payment Details ──────────────────────────────────────────────────
ALTER TABLE payment_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_details_read_own_operator" ON payment_details;
CREATE POLICY "payment_details_read_own_operator" ON payment_details
  FOR SELECT TO authenticated USING (auth.uid()::text = operator_id);

-- ─── Bank Change Requests ─────────────────────────────────────────────
ALTER TABLE bank_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bank_change_requests_read_own_operator" ON bank_change_requests;
CREATE POLICY "bank_change_requests_read_own_operator" ON bank_change_requests
  FOR SELECT TO authenticated USING (auth.uid()::text = operator_id);

DROP POLICY IF EXISTS "bank_change_requests_insert_own_operator" ON bank_change_requests;
CREATE POLICY "bank_change_requests_insert_own_operator" ON bank_change_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = operator_id);

DROP POLICY IF EXISTS "bank_change_requests_update_own_operator" ON bank_change_requests;
CREATE POLICY "bank_change_requests_update_own_operator" ON bank_change_requests
  FOR UPDATE TO authenticated USING (auth.uid()::text = operator_id);

-- ─── Audit Log Entries ────────────────────────────────────────────────
ALTER TABLE audit_log_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_log_read_own_operator" ON audit_log_entries;
CREATE POLICY "audit_log_read_own_operator" ON audit_log_entries
  FOR SELECT TO authenticated USING (auth.uid()::text = operator_id);
-- No INSERT policy: audit rows are written server-side via Prisma (bypasses RLS).
-- The previous WITH CHECK (true) would have let anon forge audit rows via the
-- Data API. Removed.

-- ─── Quote Requests ───────────────────────────────────────────────────
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quote_requests_read_own_customer" ON quote_requests;
CREATE POLICY "quote_requests_read_own_customer" ON quote_requests
  FOR SELECT TO authenticated USING (auth.uid()::text = customer_id);

DROP POLICY IF EXISTS "quote_requests_insert_own_customer" ON quote_requests;
CREATE POLICY "quote_requests_insert_own_customer" ON quote_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = customer_id);

-- ─── Offers ───────────────────────────────────────────────────────────
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Offers are private quote responses. Readable only by the operator who made
-- them or the customer who owns the linked quote request — NOT world-readable.
DROP POLICY IF EXISTS "offers_read_all" ON offers;
DROP POLICY IF EXISTS "offers_read_involved" ON offers;
CREATE POLICY "offers_read_involved" ON offers
  FOR SELECT TO authenticated
  USING (
    auth.uid()::text = operator_id
    OR EXISTS (
      SELECT 1 FROM quote_requests qr
      WHERE qr.id = offers.request_id AND auth.uid()::text = qr.customer_id
    )
  );

-- ─── Booking Intents ──────────────────────────────────────────────────
ALTER TABLE booking_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "booking_intents_read_own_customer" ON booking_intents;
CREATE POLICY "booking_intents_read_own_customer" ON booking_intents
  FOR SELECT TO authenticated USING (auth.uid()::text = customer_id);

DROP POLICY IF EXISTS "booking_intents_read_own_operator" ON booking_intents;
CREATE POLICY "booking_intents_read_own_operator" ON booking_intents
  FOR SELECT TO authenticated USING (auth.uid()::text = operator_id);

DROP POLICY IF EXISTS "booking_intents_insert_own_customer" ON booking_intents;
CREATE POLICY "booking_intents_insert_own_customer" ON booking_intents
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = customer_id);

DROP POLICY IF EXISTS "booking_intents_update_own" ON booking_intents;
CREATE POLICY "booking_intents_update_own" ON booking_intents
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = customer_id OR auth.uid()::text = operator_id);

-- ─── Packages ─────────────────────────────────────────────────────────
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Published packages are intentionally world-readable (public catalogue).
DROP POLICY IF EXISTS "packages_read_published" ON packages;
CREATE POLICY "packages_read_published" ON packages
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "packages_read_own_operator" ON packages;
CREATE POLICY "packages_read_own_operator" ON packages
  FOR SELECT TO authenticated USING (auth.uid()::text = operator_id);

DROP POLICY IF EXISTS "packages_insert_own_operator" ON packages;
CREATE POLICY "packages_insert_own_operator" ON packages
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = operator_id);

DROP POLICY IF EXISTS "packages_update_own_operator" ON packages;
CREATE POLICY "packages_update_own_operator" ON packages
  FOR UPDATE TO authenticated USING (auth.uid()::text = operator_id);

DROP POLICY IF EXISTS "packages_delete_own_operator" ON packages;
CREATE POLICY "packages_delete_own_operator" ON packages
  FOR DELETE TO authenticated USING (auth.uid()::text = operator_id);

-- ─── Complaints ───────────────────────────────────────────────────────
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "complaints_read_own_customer" ON complaints;
CREATE POLICY "complaints_read_own_customer" ON complaints
  FOR SELECT TO authenticated USING (auth.uid()::text = customer_id);

DROP POLICY IF EXISTS "complaints_read_own_operator" ON complaints;
CREATE POLICY "complaints_read_own_operator" ON complaints
  FOR SELECT TO authenticated USING (auth.uid()::text = operator_id);

DROP POLICY IF EXISTS "complaints_insert_own_customer" ON complaints;
CREATE POLICY "complaints_insert_own_customer" ON complaints
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = customer_id);

DROP POLICY IF EXISTS "complaints_update_own_operator" ON complaints;
CREATE POLICY "complaints_update_own_operator" ON complaints
  FOR UPDATE TO authenticated USING (auth.uid()::text = operator_id);

DROP POLICY IF EXISTS "complaints_update_own_customer" ON complaints;
CREATE POLICY "complaints_update_own_customer" ON complaints
  FOR UPDATE TO authenticated USING (auth.uid()::text = customer_id);
