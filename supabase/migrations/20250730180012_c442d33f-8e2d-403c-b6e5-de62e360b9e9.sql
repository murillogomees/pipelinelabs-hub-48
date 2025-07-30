-- Security Fix 2: Complete remaining database function search path protections
-- This continues fixing SQL injection vulnerabilities via search path manipulation

-- Update remaining critical functions with search_path protection
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text, 
  p_user_id uuid DEFAULT NULL::uuid, 
  p_ip_address inet DEFAULT NULL::inet, 
  p_user_agent text DEFAULT NULL::text, 
  p_event_data jsonb DEFAULT '{}'::jsonb, 
  p_risk_level text DEFAULT 'low'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.security_audit_logs (
    event_type,
    user_id,
    ip_address,
    user_agent,
    event_data,
    risk_level
  ) VALUES (
    p_event_type,
    COALESCE(p_user_id, auth.uid()),
    p_ip_address,
    p_user_agent,
    p_event_data,
    p_risk_level
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Update validate_admin_action function
CREATE OR REPLACE FUNCTION public.validate_admin_action(p_action text, p_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Log admin action attempt
  PERFORM log_security_event(
    'admin_action_attempt',
    target_user_id,
    NULL,
    NULL,
    jsonb_build_object('action', p_action),
    'medium'
  );
  
  -- Check if user is admin
  IF NOT is_super_admin() THEN
    PERFORM log_security_event(
      'unauthorized_admin_attempt',
      target_user_id,
      NULL,
      NULL,
      jsonb_build_object('action', p_action),
      'high'
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Update check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text, 
  p_max_requests integer DEFAULT 60, 
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_window_start timestamp with time zone;
  current_count integer;
  is_blocked boolean := false;
BEGIN
  current_window_start := date_trunc('minute', now()) - (extract(minute from now())::integer % p_window_minutes) * interval '1 minute';
  
  -- Clean old windows
  DELETE FROM public.rate_limits 
  WHERE window_start < current_window_start - (p_window_minutes || ' minutes')::interval;
  
  -- Check if currently blocked
  SELECT EXISTS(
    SELECT 1 FROM public.rate_limits 
    WHERE identifier = p_identifier 
    AND blocked_until > now()
  ) INTO is_blocked;
  
  IF is_blocked THEN
    RETURN false;
  END IF;
  
  -- Get or create current window count
  INSERT INTO public.rate_limits (identifier, window_start, request_count)
  VALUES (p_identifier, current_window_start, 1)
  ON CONFLICT (identifier) 
  DO UPDATE SET 
    request_count = CASE 
      WHEN rate_limits.window_start = current_window_start THEN rate_limits.request_count + 1
      ELSE 1
    END,
    window_start = current_window_start,
    updated_at = now()
  RETURNING request_count INTO current_count;
  
  -- Block if exceeded
  IF current_count > p_max_requests THEN
    UPDATE public.rate_limits 
    SET blocked_until = now() + interval '15 minutes'
    WHERE identifier = p_identifier;
    
    -- Log security event
    PERFORM log_security_event(
      'rate_limit_exceeded',
      NULL,
      NULL,
      NULL,
      jsonb_build_object('identifier', p_identifier, 'count', current_count),
      'medium'
    );
    
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Update validate_sensitive_operation function
CREATE OR REPLACE FUNCTION public.validate_sensitive_operation(
  p_operation text, 
  p_resource_type text, 
  p_resource_id text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  -- Log the operation attempt
  PERFORM log_security_event(
    'sensitive_operation_attempt',
    current_user_id,
    NULL,
    NULL,
    jsonb_build_object(
      'operation', p_operation,
      'resource_type', p_resource_type,
      'resource_id', p_resource_id
    ),
    'medium'
  );
  
  -- Check rate limiting for sensitive operations
  IF NOT check_rate_limit(
    'sensitive_ops_' || current_user_id::text,
    10, -- max 10 sensitive operations
    60  -- per hour
  ) THEN
    PERFORM log_security_event(
      'sensitive_operation_rate_limited',
      current_user_id,
      NULL,
      NULL,
      jsonb_build_object('operation', p_operation),
      'high'
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Update get_security_config function
CREATE OR REPLACE FUNCTION public.get_security_config(p_config_key text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  config_value jsonb;
BEGIN
  SELECT config_value INTO config_value
  FROM public.security_config
  WHERE config_key = p_config_key
    AND is_active = true;
  
  RETURN COALESCE(config_value, '{}');
END;
$$;