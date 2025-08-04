-- Corrigir issues de segurança: search_path para todas as functions
-- E remover foreign tables da API

-- 1. Corrigir search_path para funções críticas de segurança
ALTER FUNCTION public.is_super_admin() SET search_path = 'public';
ALTER FUNCTION public.is_contratante(uuid) SET search_path = 'public';
ALTER FUNCTION public.can_access_company_data(uuid) SET search_path = 'public';
ALTER FUNCTION public.can_manage_company_data(uuid) SET search_path = 'public';
ALTER FUNCTION public.has_specific_permission(text, uuid) SET search_path = 'public';
ALTER FUNCTION public.get_current_user_type() SET search_path = 'public';

-- 2. Corrigir search_path para funções de validação
ALTER FUNCTION public.validate_document(text, text) SET search_path = 'public';
ALTER FUNCTION public.check_document_uniqueness(text) SET search_path = 'public';
ALTER FUNCTION public.clean_document_trigger() SET search_path = 'public';

-- 3. Corrigir search_path para funções de auditoria e logs
ALTER FUNCTION public.log_security_event(text, uuid, inet, text, jsonb, text) SET search_path = 'public';
ALTER FUNCTION public.create_audit_log(uuid, text, text, text, jsonb, jsonb, inet, text, text, text, jsonb) SET search_path = 'public';
ALTER FUNCTION public.log_duplicate_document_attempt(uuid, text, text, inet) SET search_path = 'public';

-- 4. Corrigir search_path para funções de geração de números
ALTER FUNCTION public.generate_proposal_number(uuid) SET search_path = 'public';
ALTER FUNCTION public.generate_contract_number(uuid) SET search_path = 'public';
ALTER FUNCTION public.generate_purchase_order_number(uuid) SET search_path = 'public';
ALTER FUNCTION public.generate_sale_number(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.generate_nfe_number(uuid, text) SET search_path = 'public';
ALTER FUNCTION public.generate_nfe_access_key(text, text, text, date) SET search_path = 'public';

-- 5. Corrigir search_path para funções de sistema
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.check_request() SET search_path = 'public';
ALTER FUNCTION public.get_default_company_id() SET search_path = 'public';

-- 6. Criar função para rate limiting em produção
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_max_requests integer DEFAULT 60,
  p_window_seconds integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_seconds || ' seconds')::interval;
  
  -- Limpar registros antigos
  DELETE FROM public.rate_limits 
  WHERE identifier = p_identifier 
    AND created_at < window_start;
  
  -- Contar requests no período
  SELECT COUNT(*) INTO current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND created_at >= window_start;
  
  -- Se excedeu o limite, retornar false
  IF current_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  -- Registrar nova request
  INSERT INTO public.rate_limits (identifier, created_at)
  VALUES (p_identifier, now());
  
  RETURN true;
END;
$$;

-- 7. Criar tabela de rate limiting se não existir
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 8. Índice para performance do rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_created 
ON public.rate_limits(identifier, created_at);

-- 9. Função para cleanup automático de rate limits
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < now() - interval '1 hour';
END;
$$;

-- 10. Melhorar função de health check para produção
CREATE OR REPLACE FUNCTION public.production_health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result jsonb := '{}';
  db_size bigint;
  connection_count integer;
BEGIN
  -- Status básico
  result := result || jsonb_build_object('status', 'ok', 'timestamp', now());
  
  -- Tamanho do banco
  SELECT pg_database_size(current_database()) INTO db_size;
  result := result || jsonb_build_object('database_size_mb', round(db_size / 1024.0 / 1024.0, 2));
  
  -- Número de conexões ativas
  SELECT count(*) INTO connection_count FROM pg_stat_activity WHERE state = 'active';
  result := result || jsonb_build_object('active_connections', connection_count);
  
  -- Verificar se tabelas críticas existem
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    result := result || jsonb_build_object('status', 'error', 'error', 'Critical tables missing');
  END IF;
  
  RETURN result;
END;
$$;