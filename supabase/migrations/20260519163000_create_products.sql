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

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  product_group TEXT NOT NULL,
  line TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  complementary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select" ON public.products;
CREATE POLICY "public_select" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "authenticated_all" ON public.products;
CREATE POLICY "authenticated_all" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.products (code, name, product_group, line, images, specs, complementary) VALUES
('CP-101', 'Carrinho Plataforma Múltiplo', 'Carrinhos', 'Linha Leve', '["https://img.usecurling.com/p/800/600?q=platform%20cart&color=blue", "https://img.usecurling.com/p/800/600?q=trolley&color=gray", "https://img.usecurling.com/p/800/600?q=cart%20wheels&color=black"]'::jsonb, '{"Material": "Alumínio", "Capacidade": "150kg", "Rodízios": "4 giratórios"}'::jsonb, 'Ideal para corredores estreitos e peças leves.'),
('BC-305', 'Bancada Ergonômica de Montagem', 'Bancadas', 'Linha Média', '["https://img.usecurling.com/p/800/600?q=workbench&color=gray", "https://img.usecurling.com/p/800/600?q=tools&color=blue"]'::jsonb, '{"Material": "Estrutura tubular", "Tampo": "MDF revestido", "Ajuste": "Manual"}'::jsonb, 'Possui painel perfurado e calha elétrica.'),
('ES-502', 'Estante Dinâmica (Flow Rack)', 'Estantes', 'Linha Pesada', '["https://img.usecurling.com/p/800/600?q=warehouse%20shelves&color=green", "https://img.usecurling.com/p/800/600?q=storage&color=gray"]'::jsonb, '{"Material": "Aço", "Níveis": "4", "Capacidade por nível": "250kg"}'::jsonb, 'Sistema FIFO com roletes de alta resistência.')
ON CONFLICT (code) DO NOTHING;
