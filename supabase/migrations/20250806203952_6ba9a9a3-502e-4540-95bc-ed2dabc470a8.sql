-- Critical Security Fix 1: Fix Function Search Paths
-- All security definer functions should have search_path set to prevent search path injection attacks

-- Fix is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix get_user_company_id function
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Simple direct query without policy checks to avoid recursion
  RETURN (
    SELECT company_id 
    FROM public.user_companies
    WHERE user_id = auth.uid()
      AND is_active = true
    LIMIT 1
  );
END;
$function$;

-- Fix can_access_company_data function
CREATE OR REPLACE FUNCTION public.can_access_company_data(company_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      AND uc.role IN ('contratante', 'operador', 'super_admin')
      AND uc.is_active = true
  );
END;
$function$;

-- Fix can_manage_company_data function
CREATE OR REPLACE FUNCTION public.can_manage_company_data(company_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix is_contratante function
CREATE OR REPLACE FUNCTION public.is_contratante(company_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Drop and recreate has_specific_permission function with proper search path
DROP FUNCTION IF EXISTS public.has_specific_permission(text, uuid);
CREATE OR REPLACE FUNCTION public.has_specific_permission(permission_name text, company_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_permissions jsonb;
BEGIN
  -- Super admin tem todas as permissões
  IF is_super_admin() THEN
    RETURN true;
  END IF;
  
  -- Verificar se o usuário tem acesso à empresa
  IF NOT can_access_company_data(company_uuid) THEN
    RETURN false;
  END IF;
  
  -- Buscar permissões do usuário
  SELECT get_user_permissions(auth.uid()) INTO user_permissions;
  
  -- Verificar se tem a permissão específica
  RETURN COALESCE((user_permissions->>permission_name)::boolean, false);
END;
$function$;