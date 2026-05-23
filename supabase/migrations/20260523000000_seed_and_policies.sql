DO $$
DECLARE
  admin_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dante@dlean.com.br') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'dante@dlean.com.br',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
END $$;

DROP POLICY IF EXISTS "admin_all_site_content" ON public.site_content;
CREATE POLICY "admin_all_site_content" ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_site_content" ON public.site_content;
CREATE POLICY "public_read_site_content" ON public.site_content FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_products" ON public.products;
CREATE POLICY "admin_all_products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_select" ON public.products;
CREATE POLICY "public_select" ON public.products FOR SELECT TO public USING (true);

INSERT INTO public.site_content (id, type, value, metadata) VALUES
  ('logo', 'logo', 'https://skip-prod-storage.s3.amazonaws.com/attachments/1740058564030_download.png', '{}'::jsonb),
  ('hero_carousel', 'carousel', 'active', '[{"title": "Bancadas", "description": "Conheça nossas bancadas industriais.", "image": "https://img.usecurling.com/p/1600/900?q=industry&color=blue", "link": "Bancadas"}, {"title": "Carrinhos", "description": "Carrinhos de transporte e abastecimento.", "image": "https://img.usecurling.com/p/1600/900?q=warehouse&color=gray", "link": "Carrinhos"}, {"title": "Sistemas", "description": "Sistemas tubulares e estruturas.", "image": "https://img.usecurling.com/p/1600/900?q=factory&color=black", "link": "Sistemas"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
  value = EXCLUDED.value,
  metadata = EXCLUDED.metadata;

INSERT INTO public.products (id, code, name, product_group, line, images, specs, complementary) VALUES
  (gen_random_uuid(), 'B-LEV-001', 'Bancada Leve Simples', 'Bancadas', 'Linha Leve', '["https://img.usecurling.com/p/600/400?q=table&color=white"]'::jsonb, '{"Material": "Alumínio", "Capacidade": "50kg"}'::jsonb, 'Bancada para montagem leve.'),
  (gen_random_uuid(), 'B-MED-001', 'Bancada Média com Prateleira', 'Bancadas', 'Linha Média', '["https://img.usecurling.com/p/600/400?q=workbench&color=gray"]'::jsonb, '{"Material": "Aço", "Capacidade": "150kg"}'::jsonb, 'Ideal para processos intermediários.'),
  (gen_random_uuid(), 'B-PES-001', 'Bancada Pesada Estruturada', 'Bancadas', 'Linha Pesada', '["https://img.usecurling.com/p/600/400?q=steel%20table&color=black"]'::jsonb, '{"Material": "Aço Carbono", "Capacidade": "500kg"}'::jsonb, 'Para ferramentas pesadas e moldes.')
ON CONFLICT (code) DO NOTHING;
