-- Security Fix 1: Add search_path protection to critical database functions
-- This prevents SQL injection via search path manipulation

-- Update is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  access_level_name TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Buscar o nome do access_level do usuário
  SELECT al.name INTO access_level_name
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = current_user_id AND p.is_active = true AND al.is_active = true;

  RETURN COALESCE(access_level_name = 'super_admin', false);
END;
$$;

-- Update can_access_company_data function
CREATE OR REPLACE FUNCTION public.can_access_company_data(company_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Super admin pode acessar tudo
  IF is_super_admin() THEN
    RETURN true;
  END IF;
  
  -- Se company_uuid for null, só admin pode acessar
  IF company_uuid IS NULL THEN
    RETURN is_super_admin();
  END IF;
  
  -- Contratante ou operador da empresa podem acessar
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    WHERE uc.user_id = auth.uid() 
      AND uc.company_id = company_uuid
      AND uc.user_type IN ('contratante', 'operador')
      AND uc.is_active = true
  );
END;
$$;

-- Update is_contratante function
CREATE OR REPLACE FUNCTION public.is_contratante(company_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  access_level_name TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Buscar o nome do access_level do usuário
  SELECT al.name INTO access_level_name
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = current_user_id AND p.is_active = true AND al.is_active = true;

  RETURN COALESCE(access_level_name IN ('super_admin', 'contratante'), false);
END;
$$;

-- Update can_manage_company_data function
CREATE OR REPLACE FUNCTION public.can_manage_company_data(company_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Super admin pode gerenciar tudo
  IF is_super_admin() THEN
    RETURN true;
  END IF;
  
  -- Se company_uuid for null, só admin pode gerenciar
  IF company_uuid IS NULL THEN
    RETURN is_super_admin();
  END IF;
  
  -- Apenas contratante da empresa pode gerenciar
  RETURN is_contratante(company_uuid);
END;
$$;

-- Update has_specific_permission function
CREATE OR REPLACE FUNCTION public.has_specific_permission(permission_key text, company_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  -- Super admin tem todas as permissões
  IF is_super_admin() THEN
    RETURN true;
  END IF;
  
  -- Verificar permissão específica do usuário
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    WHERE uc.user_id = current_user_id
      AND (company_uuid IS NULL OR uc.company_id = company_uuid)
      AND uc.is_active = true
      AND (
        (uc.specific_permissions->permission_key)::boolean = true
        OR (uc.permissions->permission_key)::boolean = true
        OR uc.user_type = 'contratante' -- Contratante tem acesso total à empresa
      )
  );
END;
$$;