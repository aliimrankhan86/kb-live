-- ═══════════════════════════════════════════════════════════════════════
-- P1H-PACKAGE-IMAGES-BUCKET — Public Storage bucket for operator package images
-- Path convention: {userId}/{packageContextId}/{filename}
--   → userId is the 1st path segment, so RLS keys off (storage.foldername(name))[1].
-- Public bucket: anyone may read (images render on public package pages),
-- but only the owning operator may write into their own prefix.
-- ═══════════════════════════════════════════════════════════════════════

-- Public bucket, 5MB limit, images only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'package-images',
  'package-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- RLS: public read; authenticated write only into own {auth.uid()}/… prefix.
DROP POLICY IF EXISTS "package_images_select_public" ON storage.objects;
DROP POLICY IF EXISTS "package_images_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "package_images_update_own" ON storage.objects;
DROP POLICY IF EXISTS "package_images_delete_own" ON storage.objects;

CREATE POLICY "package_images_select_public" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'package-images');

CREATE POLICY "package_images_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'package-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "package_images_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'package-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'package-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "package_images_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'package-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
