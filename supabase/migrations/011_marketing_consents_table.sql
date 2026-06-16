-- Migration 011: marketing_consents table (Task 3)
-- Captures explicit, opt-in marketing email consent gathered at enquiry time.
-- A row exists ONLY when the pilgrim ticked the opt-in AND gave an email — the
-- ABSENCE of a row is the "no consent" state (there is no consent=false row).
-- `consent` is kept TRUE for audit explicitness; the write path only ever inserts
-- TRUE. Double-opt-in ready: this stores the record; no email is sent from here.
-- Dedicated table — consent is NOT bolted onto the enquiry record.

CREATE TABLE IF NOT EXISTS marketing_consents (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT        NOT NULL,
  consent           BOOLEAN     NOT NULL DEFAULT true,
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source            TEXT        NOT NULL DEFAULT 'enquiry_form',
  enquiry_reference TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Idempotent per (email, enquiry). enquiry_reference is NOT NULL so the unique
  -- constraint always dedupes (Postgres treats NULLs as distinct — avoided here).
  CONSTRAINT marketing_consents_email_reference_unique UNIQUE (email, enquiry_reference)
);

-- RLS: service role only. Written server-side via the service-role key; no public
-- reads/writes. No public policies added (mirrors enquiries / interests).
ALTER TABLE marketing_consents ENABLE ROW LEVEL SECURITY;
