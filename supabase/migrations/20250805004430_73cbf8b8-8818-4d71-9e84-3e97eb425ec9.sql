-- Corrigir função has_specific_permission para verificar permissões reais
CREATE OR REPLACE FUNCTION public.has_specific_permission(permission_key text, company_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  user_permissions jsonb;
BEGIN
  -- Super admin tem todas as permissões
  IF is_super_admin() THEN
    RETURN true;
  END IF;
  
  -- Buscar permissões do usuário através do access_level
  SELECT al.permissions INTO user_permissions
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = current_user_id 
    AND p.is_active = true
    AND al.is_active = true;
  
  -- Se não encontrou permissões, verificar se é contratante (fallback)
  IF user_permissions IS NULL THEN
    RETURN EXISTS (
      SELECT 1 
      FROM public.user_companies uc
      WHERE uc.user_id = current_user_id
        AND (company_uuid IS NULL OR uc.company_id = company_uuid)
        AND uc.is_active = true
        AND uc.role = 'contratante'
    );
  END IF;
  
  -- Verificar se tem a permissão específica
  RETURN COALESCE((user_permissions->>permission_key)::boolean, false);
END;
$function$;

-- Corrigir políticas RLS para customers (não exigir permissão específica, apenas acesso à empresa)
DROP POLICY IF EXISTS "Company customers insert" ON public.customers;
DROP POLICY IF EXISTS "Company customers update" ON public.customers;

CREATE POLICY "Company customers insert" 
ON public.customers 
FOR INSERT 
WITH CHECK (can_access_company_data(company_id) AND (company_id = get_user_company_id()));

CREATE POLICY "Company customers update" 
ON public.customers 
FOR UPDATE 
USING (can_access_company_data(company_id))
WITH CHECK (can_access_company_data(company_id));