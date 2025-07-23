-- Otimizar políticas RLS para melhor performance usando (SELECT auth.uid())

-- Primeiro, vamos atualizar as funções que usam auth.uid() para usar a versão otimizada
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT company_id 
  FROM public.user_companies 
  WHERE user_id = (SELECT auth.uid())
    AND is_active = true 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.user_id = current_user_id
      AND p.email = 'murilloggomes@gmail.com'
  ) OR EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    WHERE uc.user_id = current_user_id
      AND uc.user_type = 'super_admin'
      AND uc.is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_contratante(company_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  IF company_uuid IS NULL THEN
    RETURN EXISTS (
      SELECT 1 
      FROM public.user_companies uc
      WHERE uc.user_id = current_user_id
        AND uc.user_type = 'contratante'
        AND uc.is_active = true
    );
  ELSE
    RETURN EXISTS (
      SELECT 1 
      FROM public.user_companies uc
      WHERE uc.user_id = current_user_id
        AND uc.company_id = company_uuid
        AND uc.user_type = 'contratante'
        AND uc.is_active = true
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_operador(company_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  IF company_uuid IS NULL THEN
    RETURN EXISTS (
      SELECT 1 
      FROM public.user_companies uc
      WHERE uc.user_id = current_user_id
        AND uc.user_type = 'operador'
        AND uc.is_active = true
    );
  ELSE
    RETURN EXISTS (
      SELECT 1 
      FROM public.user_companies uc
      WHERE uc.user_id = current_user_id
        AND uc.company_id = company_uuid
        AND uc.user_type = 'operador'
        AND uc.is_active = true
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_specific_permission(permission_key text, company_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Atualizar funções de auditoria e logs para usar (SELECT auth.uid())
CREATE OR REPLACE FUNCTION public.create_audit_log(p_company_id uuid, p_action text, p_resource_type text, p_resource_id text DEFAULT NULL::text, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_severity text DEFAULT 'info'::text, p_status text DEFAULT 'success'::text, p_details jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  INSERT INTO public.audit_logs (
    company_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    severity,
    status,
    details,
    created_at
  ) VALUES (
    p_company_id,
    current_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    p_ip_address,
    p_user_agent,
    p_severity,
    p_status,
    p_details,
    now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_analytics_event(p_event_name text, p_device_type text DEFAULT NULL::text, p_route text DEFAULT NULL::text, p_duration_ms integer DEFAULT NULL::integer, p_meta jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_id UUID;
  current_company_id UUID;
  current_user_id uuid := (SELECT auth.uid());
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
    current_user_id,
    current_company_id,
    p_device_type,
    p_route,
    p_duration_ms,
    p_meta
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;