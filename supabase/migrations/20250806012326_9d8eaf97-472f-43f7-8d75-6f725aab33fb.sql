-- Atualizar políticas RLS para permitir gestão de usuários

-- Primeiro, vamos garantir que temos uma função para verificar se um usuário pode gerenciar outros usuários
CREATE OR REPLACE FUNCTION public.can_manage_users(target_company_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Super admin pode gerenciar todos os usuários
  IF is_super_admin() THEN
    RETURN true;
  END IF;
  
  -- Contratante pode gerenciar usuários da sua empresa
  IF target_company_id IS NOT NULL THEN
    RETURN is_contratante(target_company_id);
  END IF;
  
  RETURN false;
END;
$$;

-- Função para obter empresa do usuário baseado no user_id
CREATE OR REPLACE FUNCTION public.get_user_company_id_from_profile(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_uuid uuid;
BEGIN
  SELECT uc.company_id INTO company_uuid
  FROM public.user_companies uc
  WHERE uc.user_id = user_uuid
    AND uc.is_active = true
  LIMIT 1;
  
  RETURN company_uuid;
END;
$$;

-- Atualizar políticas da tabela profiles para permitir gestão de usuários

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Policy para SELECT: Super admin vê todos, contratante vê sua equipe, usuário vê próprio perfil
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
USING (
  is_super_admin() 
  OR user_id = auth.uid() 
  OR can_manage_users(get_user_company_id_from_profile(user_id))
);

-- Policy para INSERT: Super admin pode criar qualquer perfil, contratante pode criar para sua empresa
CREATE POLICY "profiles_insert_policy"
ON public.profiles
FOR INSERT
WITH CHECK (
  is_super_admin() 
  OR can_manage_users(get_user_company_id_from_profile(user_id))
);

-- Policy para UPDATE: Super admin pode atualizar qualquer perfil, contratante pode atualizar sua equipe, usuário pode atualizar próprio perfil
CREATE POLICY "profiles_update_policy"
ON public.profiles
FOR UPDATE
USING (
  is_super_admin() 
  OR user_id = auth.uid() 
  OR can_manage_users(get_user_company_id_from_profile(user_id))
)
WITH CHECK (
  is_super_admin() 
  OR user_id = auth.uid() 
  OR can_manage_users(get_user_company_id_from_profile(user_id))
);

-- Policy para DELETE: Apenas super admin pode deletar perfis
CREATE POLICY "profiles_delete_policy"
ON public.profiles
FOR DELETE
USING (is_super_admin());

-- Atualizar políticas da tabela user_companies para permitir gestão de equipe

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "user_companies_select_policy" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_insert_policy" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_update_policy" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_delete_policy" ON public.user_companies;

-- Policy para SELECT: Super admin vê tudo, contratante vê sua empresa, usuário vê própria associação
CREATE POLICY "user_companies_select_policy"
ON public.user_companies
FOR SELECT
USING (
  is_super_admin() 
  OR user_id = auth.uid() 
  OR can_manage_users(company_id)
);

-- Policy para INSERT: Super admin pode inserir qualquer associação, contratante pode adicionar usuários à sua empresa
CREATE POLICY "user_companies_insert_policy"
ON public.user_companies
FOR INSERT
WITH CHECK (
  is_super_admin() 
  OR can_manage_users(company_id)
);

-- Policy para UPDATE: Super admin pode atualizar qualquer associação, contratante pode atualizar sua equipe
CREATE POLICY "user_companies_update_policy"
ON public.user_companies
FOR UPDATE
USING (
  is_super_admin() 
  OR can_manage_users(company_id)
)
WITH CHECK (
  is_super_admin() 
  OR can_manage_users(company_id)
);

-- Policy para DELETE: Super admin pode deletar qualquer associação, contratante pode remover usuários da sua empresa
CREATE POLICY "user_companies_delete_policy"
ON public.user_companies
FOR DELETE
USING (
  is_super_admin() 
  OR can_manage_users(company_id)
);