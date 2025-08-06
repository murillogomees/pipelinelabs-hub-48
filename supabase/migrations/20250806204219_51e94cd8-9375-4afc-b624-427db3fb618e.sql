-- Critical Security Fix: Update password validation to be more strict
CREATE OR REPLACE FUNCTION public.validate_password(password_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validação básica de senha aprimorada
  -- Mínimo 8 caracteres (aumentado)
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

-- Fix all remaining functions to have proper search paths
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

-- Critical Security Fix: Remove API access from foreign tables
DO $$
BEGIN
  -- Remove permissions for foreign tables that bypass RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unused_indexes' AND table_schema = 'public') THEN
    REVOKE ALL ON TABLE public.unused_indexes FROM anon, authenticated;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'potential_duplicate_policies' AND table_schema = 'public') THEN
    REVOKE ALL ON TABLE public.potential_duplicate_policies FROM anon, authenticated;
  END IF;
END $$;