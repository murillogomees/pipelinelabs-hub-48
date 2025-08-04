-- CORREÇÃO COMPLETA DO SISTEMA DE AUTENTICAÇÃO
-- Remove todas as referências que ainda existem para validate_password

-- 1. REMOVER TODOS OS TRIGGERS E FUNÇÕES PROBLEMÁTICAS
DROP TRIGGER IF EXISTS enforce_password_strength ON auth.users;
DROP TRIGGER IF EXISTS check_password_strength_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.check_password_strength();
DROP FUNCTION IF EXISTS public.validate_password(text);

-- 2. GARANTIR QUE EXISTE UM ACCESS LEVEL PADRÃO
INSERT INTO public.access_levels (name, display_name, description, is_system, is_active)
VALUES 
  ('operador', 'Operador', 'Acesso básico do sistema', true, true),
  ('contratante', 'Contratante', 'Acesso de administrador da empresa', true, true),
  ('super_admin', 'Super Admin', 'Acesso total ao sistema', true, true)
ON CONFLICT (name) DO NOTHING;

-- 3. GARANTIR QUE EXISTE UMA EMPRESA PADRÃO
INSERT INTO public.companies (name, document, email)
VALUES ('Pipeline Labs', '00000000000191', 'admin@pipelinelabs.app')
ON CONFLICT (document) DO NOTHING;

-- 4. CRIAR FUNÇÃO PARA OBTER EMPRESA DO USUÁRIO
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_uuid uuid;
BEGIN
  -- Buscar empresa do usuário
  SELECT uc.company_id INTO company_uuid
  FROM public.user_companies uc
  WHERE uc.user_id = auth.uid() AND uc.is_active = true
  LIMIT 1;
  
  -- Se não encontrar, retornar Pipeline Labs como padrão
  IF company_uuid IS NULL THEN
    SELECT id INTO company_uuid
    FROM public.companies
    WHERE name = 'Pipeline Labs'
    LIMIT 1;
  END IF;
  
  RETURN company_uuid;
END;
$$;

-- 5. CRIAR FUNÇÃO PARA LIDAR COM NOVOS USUÁRIOS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_company_id uuid;
  operador_access_level_id uuid;
BEGIN
  -- Buscar empresa padrão
  SELECT id INTO default_company_id
  FROM public.companies
  WHERE name = 'Pipeline Labs'
  LIMIT 1;
  
  -- Buscar access level operador
  SELECT id INTO operador_access_level_id
  FROM public.access_levels
  WHERE name = 'operador' AND is_active = true
  LIMIT 1;
  
  -- Criar perfil do usuário
  INSERT INTO public.profiles (
    user_id,
    email,
    display_name,
    access_level_id,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    operador_access_level_id,
    true
  );
  
  -- Associar usuário à empresa padrão
  IF default_company_id IS NOT NULL THEN
    INSERT INTO public.user_companies (
      user_id,
      company_id,
      role,
      is_active
    ) VALUES (
      NEW.id,
      default_company_id,
      'operador',
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. CRIAR TRIGGER PARA NOVOS USUÁRIOS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. CORRIGIR POLICIES DA TABELA CUSTOMERS
DROP POLICY IF EXISTS "Users can add customers to their company" ON public.customers;
DROP POLICY IF EXISTS "Users can view customers from their company" ON public.customers;
DROP POLICY IF EXISTS "Users can update customers from their company" ON public.customers;
DROP POLICY IF EXISTS "Users can delete customers from their company" ON public.customers;

-- Políticas mais flexíveis para customers
CREATE POLICY "Company customers access"
ON public.customers FOR SELECT
USING (can_access_company_data(company_id));

CREATE POLICY "Company customers insert"
ON public.customers FOR INSERT
WITH CHECK (
  can_access_company_data(company_id) AND 
  company_id = get_user_company_id()
);

CREATE POLICY "Company customers update"
ON public.customers FOR UPDATE
USING (can_access_company_data(company_id))
WITH CHECK (can_access_company_data(company_id));

CREATE POLICY "Company customers delete"
ON public.customers FOR DELETE
USING (can_access_company_data(company_id));