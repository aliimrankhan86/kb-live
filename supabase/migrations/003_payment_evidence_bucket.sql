-- ═══════════════════════════════════════════════════════════════════════
-- P1G-PAYMENT-EVIDENCE-BUCKET — Private Storage bucket for booking payment proof
-- Path convention: {bookingIntentId}/{userId}/{filename}
--   → userId is the 2nd path segment, so RLS keys off (storage.foldername(name))[2].
-- ═══════════════════════════════════════════════════════════════════════

-- Private bucket, 10MB limit, images + PDF only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-evidence',
  'payment-evidence',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

-- RLS: only authenticated users may upload, and only into their own {…}/{auth.uid()}/… prefix.
DROP POLICY IF EXISTS "payment_evidence_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "payment_evidence_select_own" ON storage.objects;
DROP POLICY IF EXISTS "payment_evidence_update_own" ON storage.objects;
DROP POLICY IF EXISTS "payment_evidence_delete_own" ON storage.objects;

CREATE POLICY "payment_evidence_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-evidence'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "payment_evidence_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-evidence'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "payment_evidence_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'payment-evidence'
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'payment-evidence'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "payment_evidence_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'payment-evidence'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
