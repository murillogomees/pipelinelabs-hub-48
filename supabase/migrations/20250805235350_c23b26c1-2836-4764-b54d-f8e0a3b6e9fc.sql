
-- Criar tabela de profiles para armazenar dados adicionais dos usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  document TEXT,
  phone TEXT,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários possam ver e editar apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Criar tabela de relacionamento usuário-empresa se não existir
CREATE TABLE IF NOT EXISTS public.user_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'operador',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(user_id, company_id)
);

-- Habilitar RLS na tabela user_companies
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Criar políticas para user_companies
CREATE POLICY "Users can view their company relationships"
  ON public.user_companies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their company relationships"
  ON public.user_companies
  FOR ALL
  USING (auth.uid() = user_id);

-- Criar função para automaticamente criar profile quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, document, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'document',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar funções auxiliares para verificação de permissões
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT company_id 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.can_access_company_data(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    WHERE uc.user_id = auth.uid() 
    AND uc.company_id = target_company_id
    AND uc.is_active = true
  ) OR is_super_admin();
$$;

CREATE OR REPLACE FUNCTION public.can_manage_company_data(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    WHERE uc.user_id = auth.uid() 
    AND uc.company_id = target_company_id
    AND uc.is_active = true
    AND uc.role IN ('contratante', 'admin')
  ) OR is_super_admin();
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND display_name = 'Super Admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_contratante(target_company_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN target_company_id IS NULL THEN
      EXISTS (
        SELECT 1 
        FROM public.user_companies uc
        WHERE uc.user_id = auth.uid() 
        AND uc.is_active = true
        AND uc.role = 'contratante'
      )
    ELSE
      EXISTS (
        SELECT 1 
        FROM public.user_companies uc
        WHERE uc.user_id = auth.uid() 
        AND uc.company_id = target_company_id
        AND uc.is_active = true
        AND uc.role = 'contratante'
      )
    END OR is_super_admin();
$$;

CREATE OR REPLACE FUNCTION public.has_specific_permission(permission_name TEXT, target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Por enquanto, vamos permitir todos os acessos para usuários da empresa
  SELECT can_access_company_data(target_company_id);
$$;
