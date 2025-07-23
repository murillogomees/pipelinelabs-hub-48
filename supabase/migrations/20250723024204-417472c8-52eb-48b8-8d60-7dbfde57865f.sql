-- Primeiro, vamos verificar e corrigir as funções que estão faltando

-- Criar função check_request se não existir (função de segurança básica)
CREATE OR REPLACE FUNCTION public.check_request()
RETURNS BOOLEAN AS $$
BEGIN
  -- Função simples que sempre retorna true para compatibilidade
  -- Em um ambiente de produção, isso poderia implementar verificações específicas
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a função get_analytics_metrics existe e está funcionando
-- Verificar se a função create_analytics_event existe
CREATE OR REPLACE FUNCTION public.create_analytics_event(
  p_event_name text,
  p_device_type text DEFAULT NULL,
  p_route text DEFAULT NULL,
  p_duration_ms integer DEFAULT NULL,
  p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_id UUID;
  current_company_id UUID;
BEGIN
  -- Get current user's company
  current_company_id := get_user_company_id();
  
  IF current_company_id IS NULL THEN
    -- Se não tem empresa, tenta usar a empresa padrão
    current_company_id := get_default_company_id();
  END IF;
  
  IF current_company_id IS NULL THEN
    RAISE EXCEPTION 'User has no associated company';
  END IF;
  
  -- Insert analytics event
  INSERT INTO public.analytics_events (
    event_name,
    user_id,
    company_id,
    device_type,
    route,
    duration_ms,
    meta
  ) VALUES (
    p_event_name,
    auth.uid(),
    current_company_id,
    p_device_type,
    p_route,
    p_duration_ms,
    p_meta
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Verificar se a função get_analytics_metrics está funcionando
-- Recriar para garantir que está correta
CREATE OR REPLACE FUNCTION public.get_analytics_metrics(
  p_start_date date DEFAULT (CURRENT_DATE - '30 days'::interval),
  p_end_date date DEFAULT CURRENT_DATE,
  p_event_filter text DEFAULT NULL
)
RETURNS TABLE(
  total_events bigint,
  unique_users bigint,
  top_events jsonb,
  events_by_day jsonb,
  device_breakdown jsonb,
  route_breakdown jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_company_id UUID;
BEGIN
  -- Obter empresa do usuário atual
  current_company_id := get_user_company_id();
  
  -- Se não tem empresa, usar empresa padrão
  IF current_company_id IS NULL THEN
    current_company_id := get_default_company_id();
  END IF;
  
  -- Verificar se usuário tem empresa associada
  IF current_company_id IS NULL THEN
    RAISE EXCEPTION 'User has no associated company';
  END IF;
  
  -- Verificar permissões de acesso
  IF NOT (is_super_admin() OR can_access_company_data(current_company_id)) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  WITH base_events AS (
    SELECT *
    FROM public.analytics_events
    WHERE company_id = current_company_id
      AND created_at::DATE BETWEEN p_start_date AND p_end_date
      AND (p_event_filter IS NULL OR event_name ILIKE '%' || p_event_filter || '%')
  ),
  event_counts AS (
    SELECT 
      event_name,
      COUNT(*) as event_count
    FROM base_events
    GROUP BY event_name
    ORDER BY COUNT(*) DESC
    LIMIT 10
  ),
  daily_counts AS (
    SELECT 
      created_at::DATE as event_date,
      COUNT(*) as daily_count
    FROM base_events
    GROUP BY created_at::DATE
  ),
  device_counts AS (
    SELECT 
      COALESCE(device_type, 'unknown') as device,
      COUNT(*) as device_count
    FROM base_events
    GROUP BY device_type
  ),
  route_counts AS (
    SELECT 
      COALESCE(route, 'unknown') as route_name,
      COUNT(*) as route_count
    FROM base_events
    GROUP BY route
  )
  SELECT
    (SELECT COUNT(*) FROM base_events)::bigint as total_events,
    (SELECT COUNT(DISTINCT user_id) FROM base_events)::bigint as unique_users,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'event_name', event_name,
          'count', event_count
        ) ORDER BY event_count DESC
      )
      FROM event_counts
    ), '[]'::jsonb) as top_events,
    COALESCE((
      SELECT jsonb_object_agg(event_date::text, daily_count)
      FROM daily_counts
    ), '{}'::jsonb) as events_by_day,
    COALESCE((
      SELECT jsonb_object_agg(device, device_count)
      FROM device_counts
    ), '{}'::jsonb) as device_breakdown,
    COALESCE((
      SELECT jsonb_object_agg(route_name, route_count)
      FROM route_counts
    ), '{}'::jsonb) as route_breakdown;
END;
$$;