-- Critical Security Fix 1: Fix Function Search Paths (without dropping)
-- All security definer functions should have search_path set to prevent search path injection attacks

-- Update has_specific_permission function to include search path
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

-- Fix get_user_permissions function
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_permissions JSONB := '{}';
  user_access_level_id UUID;
BEGIN
  -- Buscar o access_level_id do usuário
  SELECT access_level_id INTO user_access_level_id
  FROM public.profiles
  WHERE user_id = user_uuid AND is_active = true;

  -- Se não encontrar, retornar permissões vazias
  IF user_access_level_id IS NULL THEN
    RETURN '{}';
  END IF;

  -- Buscar as permissões do access_level
  SELECT COALESCE(permissions, '{}') INTO user_permissions
  FROM public.access_levels
  WHERE id = user_access_level_id AND is_active = true;

  RETURN user_permissions;
END;
$function$;

-- Critical Security Fix 2: Strengthen password validation
CREATE OR REPLACE FUNCTION public.validate_password(password_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validação básica de senha aprimorada
  -- Mínimo 8 caracteres (aumentado de 6)
  IF LENGTH(password_text) < 8 THEN
    RETURN false;
  END IF;
  
  -- Pelo menos uma letra maiúscula
  IF password_text !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Pelo menos uma letra minúscula  
  IF password_text !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Pelo menos um número
  IF password_text !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Pelo menos um caractere especial
  IF password_text !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;