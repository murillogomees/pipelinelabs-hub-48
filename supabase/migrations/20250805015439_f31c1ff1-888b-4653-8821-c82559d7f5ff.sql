-- Dropar função existente antes de recriar
DROP FUNCTION IF EXISTS public.has_specific_permission(text, uuid);

-- Recriar função has_specific_permission corrigida
CREATE OR REPLACE FUNCTION public.has_specific_permission(permission_name TEXT, company_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_access_level TEXT;
  target_company_id UUID;
  user_role TEXT;
BEGIN
  -- Se não há usuário autenticado, retornar false
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Super admin pode tudo
  IF is_super_admin() THEN
    RETURN true;
  END IF;

  -- Usar company_uuid fornecido ou buscar empresa do usuário
  target_company_id := COALESCE(company_uuid, get_user_company_id());

  -- Se não há empresa, permitir apenas para super admin
  IF target_company_id IS NULL THEN
    RETURN is_super_admin();
  END IF;

  -- Buscar o role do usuário na empresa
  SELECT uc.role INTO user_role
  FROM public.user_companies uc
  WHERE uc.user_id = auth.uid()
    AND uc.company_id = target_company_id
    AND uc.is_active = true;

  -- Se é contratante da empresa, tem todas as permissões
  IF user_role = 'contratante' THEN
    RETURN true;
  END IF;

  -- Buscar nível de acesso do usuário
  SELECT al.name INTO user_access_level
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = auth.uid()
    AND p.is_active = true
    AND al.is_active = true;

  -- Verificar permissões específicas baseadas no nível de acesso
  CASE user_access_level
    WHEN 'super_admin' THEN
      RETURN true;
    WHEN 'contratante' THEN
      RETURN true;
    WHEN 'operador' THEN
      -- Operadores têm acesso limitado mas podem ver produtos
      RETURN permission_name IN ('produtos', 'vendas', 'clientes', 'estoque');
    ELSE
      RETURN false;
  END CASE;
END;
$$;