DO $$
BEGIN
  -- 1. Create images bucket if not exists
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('images', 'images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Storage RLS Policies for images bucket
DROP POLICY IF EXISTS "public_read_images" ON storage.objects;
CREATE POLICY "public_read_images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'images');

DROP POLICY IF EXISTS "auth_insert_images" ON storage.objects;
CREATE POLICY "auth_insert_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "auth_update_images" ON storage.objects;
CREATE POLICY "auth_update_images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'images');

DROP POLICY IF EXISTS "auth_delete_images" ON storage.objects;
CREATE POLICY "auth_delete_images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'images');
