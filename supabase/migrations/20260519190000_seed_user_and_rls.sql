DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed administrative user
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
      NULL, '', '', ''
    );
  END IF;

  -- Insert dummy products to support the Carousel dynamic images requirement
  INSERT INTO public.products (id, code, name, product_group, line, images, specs)
  VALUES 
    (gen_random_uuid(), 'FR-001', 'Flow Rack Padrão', 'Sistemas', 'Flow Rack', '["https://img.usecurling.com/p/800/600?q=industrial%20rack&color=blue"]'::jsonb, '{}'::jsonb),
    (gen_random_uuid(), 'FR-002', 'Mini Flow Rack de Bancada', 'Sistemas', 'Flow Rack', '["https://img.usecurling.com/p/800/600?q=workbench%20rack&color=blue"]'::jsonb, '{}'::jsonb),
    (gen_random_uuid(), 'FR-003', 'Flow Rack com Retorno', 'Sistemas', 'Flow Rack', '["https://img.usecurling.com/p/800/600?q=return%20rack&color=blue"]'::jsonb, '{}'::jsonb),
    (gen_random_uuid(), 'FR-004', 'Flow Rack Super Pesado', 'Sistemas', 'Flow Rack', '["https://img.usecurling.com/p/800/600?q=heavy%20rack&color=blue"]'::jsonb, '{}'::jsonb)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- Setup RLS policy to ensure products are readable publicly
DROP POLICY IF EXISTS "public_select" ON public.products;
CREATE POLICY "public_select" ON public.products FOR SELECT TO public USING (true);
