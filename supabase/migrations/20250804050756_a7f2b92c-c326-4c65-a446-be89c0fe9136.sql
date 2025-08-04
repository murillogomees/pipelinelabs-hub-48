-- Corrigir rate limiting e outras melhorias de produção

-- 1. Drop e recriar função de rate limiting
DROP FUNCTION IF EXISTS public.check_rate_limit(text, integer, integer);

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

-- 2. Criar tabela de configurações de produção
CREATE TABLE IF NOT EXISTS public.production_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL DEFAULT '{}',
  environment text NOT NULL DEFAULT 'production',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Inserir configurações padrão de produção
INSERT INTO public.production_config (config_key, config_value, environment) VALUES 
('rate_limiting', '{"enabled": true, "max_requests_per_minute": 60, "max_requests_per_hour": 1000}', 'production'),
('security', '{"csrf_enabled": true, "force_https": true, "session_timeout_hours": 8}', 'production'),
('monitoring', '{"sentry_enabled": true, "analytics_enabled": true, "performance_monitoring": true}', 'production'),
('cache', '{"enabled": true, "ttl_seconds": 300, "max_size_mb": 100}', 'production'),
('backup', '{"enabled": true, "frequency": "daily", "retention_days": 30}', 'production')
ON CONFLICT (config_key) DO NOTHING;

-- 4. Função para aplicar configurações de ambiente
CREATE OR REPLACE FUNCTION public.get_production_config(p_config_key text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT config_value
  FROM public.production_config
  WHERE config_key = p_config_key
    AND is_active = true
  LIMIT 1;
$$;

-- 5. Tabela de métricas de performance
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text NOT NULL DEFAULT 'ms',
  environment text NOT NULL DEFAULT 'production',
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_created 
ON public.performance_metrics(metric_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_environment 
ON public.performance_metrics(environment, created_at DESC);

-- 7. Função para registrar métricas
CREATE OR REPLACE FUNCTION public.record_performance_metric(
  p_metric_name text,
  p_metric_value numeric,
  p_metric_unit text DEFAULT 'ms',
  p_environment text DEFAULT 'production'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  metric_id uuid;
BEGIN
  INSERT INTO public.performance_metrics (
    metric_name,
    metric_value,
    metric_unit,
    environment
  ) VALUES (
    p_metric_name,
    p_metric_value,
    p_metric_unit,
    p_environment
  ) RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$;

-- 8. Trigger para updated_at na production_config
CREATE OR REPLACE FUNCTION public.update_production_config_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_production_config_updated_at ON public.production_config;
CREATE TRIGGER update_production_config_updated_at
  BEFORE UPDATE ON public.production_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_production_config_updated_at();

-- 9. RLS para tabelas de produção
ALTER TABLE public.production_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 10. Políticas RLS
CREATE POLICY "Super admins can manage production config" 
ON public.production_config FOR ALL 
USING (is_super_admin());

CREATE POLICY "Everyone can view active production config" 
ON public.production_config FOR SELECT 
USING (is_active = true);

CREATE POLICY "System can insert performance metrics" 
ON public.performance_metrics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Super admins can view performance metrics" 
ON public.performance_metrics FOR SELECT 
USING (is_super_admin());

CREATE POLICY "System can manage rate limits" 
ON public.rate_limits FOR ALL 
USING (true);