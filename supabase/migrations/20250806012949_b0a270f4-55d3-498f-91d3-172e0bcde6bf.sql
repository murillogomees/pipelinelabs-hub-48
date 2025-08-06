-- Corrigir a função is_super_admin() para funcionar corretamente
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
  -- Se não há usuário logado, retornar false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Buscar o nome do access_level do usuário
  SELECT al.name INTO access_level_name
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = current_user_id 
    AND p.is_active = true 
    AND al.is_active = true;

  -- Retornar true se for super_admin
  RETURN COALESCE(access_level_name = 'super_admin', false);
END;
$$;

-- Também atualizar a função can_access_company_data para melhor clareza
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
      AND uc.role IN ('contratante', 'operador', 'super_admin')
      AND uc.is_active = true
  );
END;
$$;