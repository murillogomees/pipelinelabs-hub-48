-- Fix missing user data and RLS policies
-- This migration creates the missing user profile and company association

-- First, let's check if we need to create a default access level
INSERT INTO public.access_levels (name, display_name, description, permissions, is_active, is_system)
VALUES (
  'operador',
  'Operador',
  'Usuário operador com permissões básicas',
  '{"vendas": true, "compras": true, "estoque": true, "clientes": true, "fornecedores": true, "produtos": true, "relatorios": false, "admin": false, "planos": false, "sistema": false, "financeiro": false, "contratos": false}',
  true,
  true
)
ON CONFLICT (name) DO NOTHING;

-- Create default contratante access level
INSERT INTO public.access_levels (name, display_name, description, permissions, is_active, is_system)
VALUES (
  'contratante',
  'Contratante',
  'Usuário contratante com permissões avançadas',
  '{"vendas": true, "compras": true, "estoque": true, "clientes": true, "fornecedores": true, "produtos": true, "relatorios": true, "admin": true, "planos": true, "sistema": false, "financeiro": true, "contratos": true}',
  true,
  true
)
ON CONFLICT (name) DO NOTHING;

-- Get the operador access level ID
DO $$
DECLARE
  operador_access_level_id UUID;
  user_company_id UUID;
BEGIN
  -- Get operador access level ID
  SELECT id INTO operador_access_level_id
  FROM public.access_levels
  WHERE name = 'operador'
  LIMIT 1;

  -- Create profile for the user if it doesn't exist
  INSERT INTO public.profiles (
    user_id,
    email,
    display_name,
    document,
    phone,
    access_level_id,
    is_active
  )
  SELECT 
    'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid,
    'murillogomes781@gmail.com',
    'Claudia Maria G Gomes',
    '01224117000111',
    '61983496459',
    operador_access_level_id,
    true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = 'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid
  );

  -- Get the user's company ID (should be the existing one)
  SELECT id INTO user_company_id
  FROM public.companies
  WHERE name = 'Fakezinhow#2752'
     OR document = '01224117000111'
  LIMIT 1;

  -- If no company exists, create one
  IF user_company_id IS NULL THEN
    INSERT INTO public.companies (
      name,
      document,
      email,
      user_id
    ) VALUES (
      'Fakezinhow#2752',
      '01224117000111',
      'murillogomes781@gmail.com',
      'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid
    ) RETURNING id INTO user_company_id;
  END IF;

  -- Create user_companies association if it doesn't exist
  INSERT INTO public.user_companies (
    user_id,
    company_id,
    role,
    is_active
  )
  SELECT
    'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid,
    user_company_id,
    'contratante',
    true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_companies 
    WHERE user_id = 'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid
      AND company_id = user_company_id
  );

END $$;

-- Update the simple policies to prevent any recursion issues
DROP POLICY IF EXISTS "simple_user_companies_select" ON public.user_companies;
DROP POLICY IF EXISTS "simple_user_companies_insert" ON public.user_companies;
DROP POLICY IF EXISTS "simple_user_companies_update" ON public.user_companies;
DROP POLICY IF EXISTS "simple_user_companies_delete" ON public.user_companies;

-- Create new safe policies
CREATE POLICY "safe_user_companies_select" 
ON public.user_companies FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = auth.uid() 
      AND al.name = 'super_admin'
      AND p.is_active = true
  )
);

CREATE POLICY "safe_user_companies_insert" 
ON public.user_companies FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = auth.uid() 
      AND al.name = 'super_admin'
      AND p.is_active = true
  )
);

CREATE POLICY "safe_user_companies_update" 
ON public.user_companies FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = auth.uid() 
      AND al.name = 'super_admin'
      AND p.is_active = true
  )
);

CREATE POLICY "safe_user_companies_delete" 
ON public.user_companies FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = auth.uid() 
      AND al.name = 'super_admin'
      AND p.is_active = true
  )
);