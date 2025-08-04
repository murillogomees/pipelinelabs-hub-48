-- Primeiro remover e recriar as funções com os tipos corretos

-- 1. Remover e recriar get_current_user_type
DROP FUNCTION IF EXISTS public.get_current_user_type();

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

-- 2. Remover e recriar is_company_contratante  
DROP FUNCTION IF EXISTS public.is_company_contratante(uuid);

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