-- Atualizar função can_access_company_data para dar acesso total a administradores
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
      AND uc.user_type IN ('contratante', 'operador')
      AND uc.is_active = true
  );
END;
$function$;

-- Atualizar função can_manage_company_data para dar acesso total a administradores
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

-- Atualizar função has_specific_permission para dar acesso total a administradores
CREATE OR REPLACE FUNCTION public.has_specific_permission(permission_key text, company_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;