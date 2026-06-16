-- Migration 010: enquiries table
-- Stores the canonical pilgrim enquiry (Task 2: one package, one enquiry, one operator).
-- Anonymous capture — no customer FK. Mirrors the Prisma `Enquiry` model.
-- Marketing opt-in / consent columns are intentionally NOT here yet (Task 3).

CREATE TABLE IF NOT EXISTS enquiries (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT        NOT NULL UNIQUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  package_id     TEXT        NOT NULL,
  operator_id    TEXT,
  package_title  TEXT,
  operator_name  TEXT,
  name           TEXT        NOT NULL,
  email          TEXT,
  phone          TEXT,
  travel_month   TEXT,
  message        TEXT
);

-- RLS: service role only. Enquiries are written server-side via the service-role
-- key (no public reads/writes). No public policies are added.
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
