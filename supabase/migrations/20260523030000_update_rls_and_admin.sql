DO $$
BEGIN
  -- 1. Ensure the admin user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dante@dlean.com.br') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      gen_random_uuid(),
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

  -- 2. Update existing products to match the new group names if they changed
  UPDATE public.products 
  SET product_group = 'Carrinhos-Estantes' 
  WHERE product_group IN ('Carrinhos', 'Estantes');

END $$;

-- 3. Ensure RLS policies are correct for public/authenticated
DROP POLICY IF EXISTS "public_read_site_content" ON public.site_content;
CREATE POLICY "public_read_site_content" ON public.site_content FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_site_content" ON public.site_content;
CREATE POLICY "admin_all_site_content" ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_select" ON public.products;
CREATE POLICY "public_select" ON public.products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_products" ON public.products;
CREATE POLICY "admin_all_products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
