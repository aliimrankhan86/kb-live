-- Migration 007: interests table
-- Stores "notify me" interest registrations (waitlist / availability alerts).
-- Replaces in-memory MockDB.saveInterest / MockDB.getInterests.

CREATE TABLE IF NOT EXISTS interests (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL,
  type       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT interests_email_type_unique UNIQUE (email, type)
);

-- RLS: service role only (no user-facing reads needed)
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- No public policies — only service role key can insert/select.
