-- ═══════════════════════════════════════════════════════════════════════
-- 006 — payment-evidence: broaden read to involved operator + admin
--
-- 003 created the private payment-evidence bucket with owner-only access
-- (the uploading customer, keyed on path segment [2] = auth.uid()).
-- Path convention: {bookingIntentId}/{userId}/{filename}
--   → segment [1] = bookingIntentId, segment [2] = customer userId.
--
-- This adds READ access for:
--   • the operator party to the booking (segment [1] → booking_intents.operator_id)
--   • admins (JWT app_metadata.role = 'admin')
-- consistent with the RBAC model in AI_NOTES §5 ("evidence visible to the
-- customer, involved operator, or admin"). Write access is unchanged: only the
-- owning customer can insert/update/delete their own evidence.
--
-- NOTE: enabling these policies is forward-compatible and harmless until a UI /
-- signed-download path consumes them. Whether operator/admin evidence *review*
-- ships at launch remains the business decision tracked in AI_NOTES §8
-- (⚠️ UNRESOLVED DEPENDENCY — Payment evidence RLS).
--
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════

-- Operator party to the booking may read evidence for that booking.
DROP POLICY IF EXISTS "payment_evidence_select_operator" ON storage.objects;
CREATE POLICY "payment_evidence_select_operator" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-evidence'
    AND EXISTS (
      SELECT 1 FROM public.booking_intents bi
      WHERE bi.id::text = (storage.foldername(name))[1]
        AND auth.uid()::text = bi.operator_id
    )
  );

-- Admins may read all payment evidence (review / dispute handling).
DROP POLICY IF EXISTS "payment_evidence_select_admin" ON storage.objects;
CREATE POLICY "payment_evidence_select_admin" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-evidence'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
