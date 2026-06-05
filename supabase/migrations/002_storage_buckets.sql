-- ═══════════════════════════════════════════════════════════════════════
-- P1F-STORAGE-BUCKETS — Supabase Storage private buckets
-- ═══════════════════════════════════════════════════════════════════════

-- Evidence files bucket (private, no public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-files',
  'evidence-files',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- Operator exports bucket (private, no public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'operator-exports',
  'operator-exports',
  false,
  10485760, -- 10MB
  ARRAY['text/csv', 'application/json']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['text/csv', 'application/json'];

-- RLS policy: evidence-files — users can only access their own booking intent evidence
CREATE POLICY "evidence_files_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'evidence-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "evidence_files_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'evidence-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "evidence_files_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'evidence-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS policy: operator-exports — operators can only access their own exports
CREATE POLICY "operator_exports_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'operator-exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "operator_exports_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'operator-exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "operator_exports_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'operator-exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );