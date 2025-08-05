-- Correções críticas de segurança - SET search_path nas funções

-- 1. Corrigir função update_marketplace_channels_updated_at
CREATE OR REPLACE FUNCTION public.update_marketplace_channels_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Corrigir função generate_proposal_number (primeira versão)
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    next_number INTEGER;
    current_year TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    next_number := 1;
    RETURN 'PROP-' || LPAD(next_number::TEXT, 4, '0') || '/' || current_year;
END;
$function$;

-- 3. Corrigir função update_auditoria_historico_updated_at
CREATE OR REPLACE FUNCTION public.update_auditoria_historico_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. Corrigir função update_auditoria_config_updated_at
CREATE OR REPLACE FUNCTION public.update_auditoria_config_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 5. Corrigir função update_prompt_logs_updated_at
CREATE OR REPLACE FUNCTION public.update_prompt_logs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.applied_at = CASE 
    WHEN NEW.status = 'applied' AND OLD.status != 'applied' THEN now()
    ELSE OLD.applied_at
  END;
  
  NEW.rolled_back_at = CASE 
    WHEN NEW.status = 'rolled_back' AND OLD.status != 'rolled_back' THEN now()
    ELSE OLD.rolled_back_at
  END;
  
  RETURN NEW;
END;
$function$;

-- 6. Corrigir função update_access_levels_updated_at
CREATE OR REPLACE FUNCTION public.update_access_levels_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 7. Corrigir função update_nfe_xmls_updated_at
CREATE OR REPLACE FUNCTION public.update_nfe_xmls_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 8. Corrigir função update_sales_updated_at
CREATE OR REPLACE FUNCTION public.update_sales_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 9. Corrigir função update_analytics_snapshots_updated_at
CREATE OR REPLACE FUNCTION public.update_analytics_snapshots_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN  
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 10. Corrigir função clean_document_trigger
CREATE OR REPLACE FUNCTION public.clean_document_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.document IS NOT NULL THEN
    NEW.document := REGEXP_REPLACE(NEW.document, '[^0-9]', '', 'g');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 11. Corrigir função update_modified_column
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$function$;

-- 12. Corrigir função update_project_history_updated_at
CREATE OR REPLACE FUNCTION public.update_project_history_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 13. Corrigir função update_landing_page_config_updated_at
CREATE OR REPLACE FUNCTION public.update_landing_page_config_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Adicionar validação adicional de segurança
CREATE OR REPLACE FUNCTION public.validate_function_security()
RETURNS TABLE(function_name text, has_search_path boolean, security_level text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.proname::text as function_name,
    (p.proconfig IS NOT NULL AND 'search_path=public' = ANY(p.proconfig)) as has_search_path,
    CASE 
      WHEN p.prosecdef THEN 'SECURITY DEFINER'
      ELSE 'SECURITY INVOKER'
    END as security_level
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prosecdef = true;
END;
$function$;