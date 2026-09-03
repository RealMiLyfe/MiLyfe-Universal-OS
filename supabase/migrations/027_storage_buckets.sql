-- ============================================================================
-- MiLyfe — Storage buckets for real file uploads
-- Migration 027
--
-- Buckets for media (audio/video/covers), shop product images, avatars/covers.
-- Public read; authenticated users write to their own folder (path = uid/...).
-- ============================================================================

-- Create buckets (id, name, public).
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('media', 'media', TRUE),
  ('shop', 'shop', TRUE),
  ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Public read for these buckets.
DROP POLICY IF EXISTS "public_read_media" ON storage.objects;
CREATE POLICY "public_read_media" ON storage.objects
  FOR SELECT USING (bucket_id IN ('media', 'shop', 'avatars'));

-- Authenticated users can upload/update/delete only within their own folder
-- (first path segment must equal their uid).
DROP POLICY IF EXISTS "own_folder_write_media" ON storage.objects;
CREATE POLICY "own_folder_write_media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('media', 'shop', 'avatars')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "own_folder_update_media" ON storage.objects;
CREATE POLICY "own_folder_update_media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('media', 'shop', 'avatars')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "own_folder_delete_media" ON storage.objects;
CREATE POLICY "own_folder_delete_media" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('media', 'shop', 'avatars')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
