-- Corrigir as funções que referenciam user_type incorretamente

-- 1. Corrigir get_current_user_type
CREATE OR REPLACE FUNCTION public.get_current_user_type()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role 
  FROM public.user_companies 
  WHERE user_id = auth.uid() 
    AND is_active = true 
  LIMIT 1;
$function$;

-- 2. Corrigir is_company_contratante
CREATE OR REPLACE FUNCTION public.is_company_contratante(company_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_companies 
    WHERE user_id = auth.uid() 
      AND company_id = company_uuid
      AND role = 'contratante'
      AND is_active = true
  );
$function$;

-- 3. Corrigir can_access_company_data
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
      AND uc.role IN ('contratante', 'operador')
      AND uc.is_active = true
  );
END;
$function$;

-- 4. Corrigir has_specific_permission
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
      AND uc.role = 'contratante' -- Contratante tem acesso total à empresa
  );
END;
$function$;