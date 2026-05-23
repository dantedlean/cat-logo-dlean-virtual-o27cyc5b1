DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $$;

-- Ensure RLS policies on site_content
DROP POLICY IF EXISTS "public_read_site_content" ON public.site_content;
CREATE POLICY "public_read_site_content" ON public.site_content
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_site_content" ON public.site_content;
CREATE POLICY "admin_all_site_content" ON public.site_content
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'email'::text) = 'dante@dlean.com.br'::text)
  WITH CHECK ((auth.jwt() ->> 'email'::text) = 'dante@dlean.com.br'::text);

-- Seed initial logo if not exists
INSERT INTO public.site_content (id, type, value)
VALUES ('logo', 'logo', 'https://skip-prod-storage.s3.amazonaws.com/attachments/1740058564030_download.png')
ON CONFLICT (id) DO NOTHING;
