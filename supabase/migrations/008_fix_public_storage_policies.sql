-- ═══════════════════════════════════════════════════════════════════════
-- 008 — Fix evidence-files + operator-exports: {public} → {authenticated}
--
-- Both buckets had policies scoped to the `public` role, allowing
-- unauthenticated users to read, insert, and delete files. Tightened to
-- `authenticated` only. Scoping logic (foldername[1] = auth.uid()) unchanged.
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════

-- ─── evidence-files ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "evidence_files_select_own" ON storage.objects;
CREATE POLICY "evidence_files_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'evidence-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "evidence_files_insert_own" ON storage.objects;
CREATE POLICY "evidence_files_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'evidence-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "evidence_files_delete_own" ON storage.objects;
CREATE POLICY "evidence_files_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'evidence-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── operator-exports ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "operator_exports_select_own" ON storage.objects;
CREATE POLICY "operator_exports_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'operator-exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "operator_exports_insert_own" ON storage.objects;
CREATE POLICY "operator_exports_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'operator-exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "operator_exports_delete_own" ON storage.objects;
CREATE POLICY "operator_exports_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'operator-exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
