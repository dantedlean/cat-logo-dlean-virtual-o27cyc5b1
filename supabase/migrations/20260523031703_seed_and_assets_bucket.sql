DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Create assets bucket if not exists
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('assets', 'assets', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

  -- 2. Seed Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dante@dlean.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'dante@dlean.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Dante"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- 3. Seed site_content for company_logo
  INSERT INTO public.site_content (id, type, value, metadata)
  VALUES (
    'company_logo',
    'logo',
    'https://skip-prod-storage.s3.amazonaws.com/attachments/1740058564030_download.png',
    '{}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage RLS Policies for assets bucket
DROP POLICY IF EXISTS "public_read_assets" ON storage.objects;
CREATE POLICY "public_read_assets" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'assets');

DROP POLICY IF EXISTS "auth_insert_assets" ON storage.objects;
CREATE POLICY "auth_insert_assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assets');

DROP POLICY IF EXISTS "auth_update_assets" ON storage.objects;
CREATE POLICY "auth_update_assets" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'assets');

DROP POLICY IF EXISTS "auth_delete_assets" ON storage.objects;
CREATE POLICY "auth_delete_assets" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'assets');

-- Ensure RLS on site_content is correctly set
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_site_content" ON public.site_content;
CREATE POLICY "admin_all_site_content" ON public.site_content
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_site_content" ON public.site_content;
CREATE POLICY "public_read_site_content" ON public.site_content
  FOR SELECT TO public USING (true);
