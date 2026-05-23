DO $$
BEGIN
  -- 1. Create or ensure RLS policies for public access are in place
  DROP POLICY IF EXISTS "public_select" ON public.products;
  CREATE POLICY "public_select" ON public.products
    FOR SELECT TO public USING (true);

  DROP POLICY IF EXISTS "public_read_site_content" ON public.site_content;
  CREATE POLICY "public_read_site_content" ON public.site_content
    FOR SELECT TO public USING (true);

  -- 2. Update existing data to split "Carrinhos-Estantes"
  UPDATE public.products 
  SET product_group = 'Carrinhos' 
  WHERE product_group = 'Carrinhos-Estantes' AND name ILIKE '%carrinho%';

  UPDATE public.products 
  SET product_group = 'Estantes' 
  WHERE product_group = 'Carrinhos-Estantes';

END $$;

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 3. Seed user dante@dlean.com.br
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
      '{"name": "Dante"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
  END IF;
END $$;
