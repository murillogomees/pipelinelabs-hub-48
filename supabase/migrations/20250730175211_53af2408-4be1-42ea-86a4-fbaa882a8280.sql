
-- Criar tabela user_companies que está faltando
CREATE TABLE public.user_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'operador',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Habilitar RLS
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own company associations"
  ON public.user_companies
  FOR SELECT
  USING (auth.uid() = user_id OR is_super_admin());

CREATE POLICY "Super admins can manage user companies"
  ON public.user_companies
  FOR ALL
  USING (is_super_admin());

-- Criar função RPC para analytics que está faltando
CREATE OR REPLACE FUNCTION public.create_analytics_event(
  p_event_name TEXT,
  p_device_type TEXT DEFAULT 'desktop',
  p_route TEXT DEFAULT '',
  p_duration_ms INTEGER DEFAULT NULL,
  p_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_event_id UUID;
BEGIN
  -- Obter user_id atual
  v_user_id := auth.uid();
  
  -- Obter company_id do usuário (primeira empresa encontrada)
  SELECT c.id INTO v_company_id
  FROM companies c
  LIMIT 1;
  
  -- Se não encontrar empresa, usar uma empresa padrão
  IF v_company_id IS NULL THEN
    v_company_id := gen_random_uuid();
  END IF;
  
  -- Inserir evento de analytics
  INSERT INTO public.analytics_events (
    user_id,
    company_id,
    event_name,
    device_type,
    route,
    duration_ms,
    meta
  )
  VALUES (
    v_user_id,
    v_company_id,
    p_event_name,
    p_device_type,
    p_route,
    p_duration_ms,
    p_meta
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Criar função para obter métricas de analytics
CREATE OR REPLACE FUNCTION public.get_analytics_metrics(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_event_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_events BIGINT,
  unique_users BIGINT,
  top_events JSONB,
  events_by_day JSONB,
  device_breakdown JSONB,
  route_breakdown JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Definir datas padrão
  v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end_date := COALESCE(p_end_date, CURRENT_DATE);
  
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_events,
    COUNT(DISTINCT user_id)::BIGINT as unique_users,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('event_name', event_name, 'count', count))
       FROM (
         SELECT event_name, COUNT(*) as count
         FROM analytics_events
         WHERE created_at::date BETWEEN v_start_date AND v_end_date
         AND (p_event_filter IS NULL OR event_name ILIKE '%' || p_event_filter || '%')
         GROUP BY event_name
         ORDER BY count DESC
         LIMIT 10
       ) top_events_sub), 
      '[]'::jsonb
    ) as top_events,
    COALESCE(
      (SELECT jsonb_object_agg(date_str, count)
       FROM (
         SELECT created_at::date::text as date_str, COUNT(*) as count
         FROM analytics_events
         WHERE created_at::date BETWEEN v_start_date AND v_end_date
         AND (p_event_filter IS NULL OR event_name ILIKE '%' || p_event_filter || '%')
         GROUP BY created_at::date
         ORDER BY created_at::date
       ) events_by_day_sub), 
      '{}'::jsonb
    ) as events_by_day,
    COALESCE(
      (SELECT jsonb_object_agg(device_type, count)
       FROM (
         SELECT COALESCE(device_type, 'unknown') as device_type, COUNT(*) as count
         FROM analytics_events
         WHERE created_at::date BETWEEN v_start_date AND v_end_date
         AND (p_event_filter IS NULL OR event_name ILIKE '%' || p_event_filter || '%')
         GROUP BY device_type
       ) device_breakdown_sub), 
      '{}'::jsonb
    ) as device_breakdown,
    COALESCE(
      (SELECT jsonb_object_agg(route, count)
       FROM (
         SELECT COALESCE(route, 'unknown') as route, COUNT(*) as count
         FROM analytics_events
         WHERE created_at::date BETWEEN v_start_date AND v_end_date
         AND (p_event_filter IS NULL OR event_name ILIKE '%' || p_event_filter || '%')
         GROUP BY route
         ORDER BY count DESC
         LIMIT 20
       ) route_breakdown_sub), 
      '{}'::jsonb
    ) as route_breakdown
  FROM analytics_events
  WHERE created_at::date BETWEEN v_start_date AND v_end_date
  AND (p_event_filter IS NULL OR event_name ILIKE '%' || p_event_filter || '%');
END;
$$;
