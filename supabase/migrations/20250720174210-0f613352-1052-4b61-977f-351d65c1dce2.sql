
-- Fase 1: Reestruturação do Banco de Dados

-- 1. Criar enum para tipos de usuário
CREATE TYPE public.user_type AS ENUM ('super_admin', 'contratante', 'operador');

-- 2. Modificar tabela user_companies para novo sistema
ALTER TABLE public.user_companies 
ADD COLUMN IF NOT EXISTS user_type public.user_type DEFAULT 'operador',
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS specific_permissions JSONB DEFAULT '{}';

-- 3. Atualizar usuários existentes baseado no email e role atual
-- Super admin (email específico)
UPDATE public.user_companies 
SET user_type = 'super_admin'
WHERE user_id IN (
    SELECT user_id FROM public.profiles 
    WHERE email = 'murilloggomes@gmail.com'
);

-- Contratantes (usuários com role 'admin' que não são super admin)
UPDATE public.user_companies 
SET user_type = 'contratante'
WHERE role = 'admin' 
  AND user_type != 'super_admin';

-- Operadores (todos os outros usuários)
UPDATE public.user_companies 
SET user_type = 'operador'
WHERE role = 'user' 
  AND user_type != 'super_admin';

-- 4. Criar função para verificar tipo de usuário
CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS public.user_type
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT user_type 
  FROM public.user_companies 
  WHERE user_id = auth.uid() 
    AND is_active = true 
  LIMIT 1;
$function$;

-- 5. Criar função para verificar se usuário é contratante da empresa
CREATE OR REPLACE FUNCTION public.is_company_contratante(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_companies 
    WHERE user_id = auth.uid() 
      AND company_id = company_uuid
      AND user_type = 'contratante'
      AND is_active = true
  );
$function$;

-- 6. Criar função para verificar se usuário pode acessar dados da empresa
CREATE OR REPLACE FUNCTION public.can_access_company_data(company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_companies 
    WHERE user_id = auth.uid() 
      AND company_id = company_uuid
      AND is_active = true
      AND user_type IN ('super_admin', 'contratante', 'operador')
  ) OR is_super_admin();
$function$;

-- 7. Atualizar função is_current_user_admin para incluir contratante
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT is_super_admin() OR EXISTS (
    SELECT 1 
    FROM public.user_companies 
    WHERE user_id = auth.uid() 
      AND user_type IN ('super_admin', 'contratante')
      AND is_active = true
  );
$function$;

-- 8. Criar políticas RLS mais específicas para user_companies
DROP POLICY IF EXISTS "Admins can manage user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Admins can insert user companies" ON public.user_companies;

-- Super admins podem gerenciar todos os usuários
CREATE POLICY "Super admins can manage all user_companies" 
ON public.user_companies 
FOR ALL 
USING (is_super_admin());

-- Contratantes podem gerenciar usuários da sua empresa
CREATE POLICY "Contratantes can manage company users" 
ON public.user_companies 
FOR ALL 
USING (
  user_type = 'contratante' 
  AND company_id = get_user_company_id()
);

-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own data" 
ON public.user_companies 
FOR SELECT 
USING (user_id = auth.uid());

-- Contratantes podem inserir novos operadores na sua empresa
CREATE POLICY "Contratantes can insert operadores" 
ON public.user_companies 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_companies uc
    WHERE uc.user_id = auth.uid()
      AND uc.user_type = 'contratante'
      AND uc.company_id = company_id
      AND uc.is_active = true
  )
  AND user_type = 'operador'
);

-- 9. Atualizar RLS para outras tabelas considerando operadores por departamento
-- Exemplo para produtos (operadores só veem produtos do seu departamento se especificado)
DROP POLICY IF EXISTS "Company scoped select" ON public.products;

CREATE POLICY "Company scoped select products" 
ON public.products 
FOR SELECT 
USING (
  company_id = get_user_company_id() 
  OR is_super_admin()
);

-- 10. Criar tabela de departamentos para melhor organização
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS policies para departments
CREATE POLICY "Company scoped select departments" 
ON public.departments 
FOR SELECT 
USING (company_id = get_user_company_id() OR is_super_admin());

CREATE POLICY "Company admins can manage departments" 
ON public.departments 
FOR ALL 
USING (
  (company_id = get_user_company_id() AND get_current_user_type() IN ('contratante', 'super_admin'))
  OR is_super_admin()
);

-- Trigger para updated_at em departments
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
