-- CRITICAL SECURITY FIX: Add search_path protection to all database functions
-- This prevents search_path injection attacks

-- Fix search path for all security-critical functions
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID := auth.uid();
  access_level_name TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Buscar o nome do access_level do usuário
  SELECT al.name INTO access_level_name
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = current_user_id AND p.is_active = true AND al.is_active = true;

  RETURN COALESCE(access_level_name = 'super_admin', false);
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_contratante(company_uuid uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID := auth.uid();
  access_level_name TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Buscar o nome do access_level do usuário
  SELECT al.name INTO access_level_name
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = current_user_id AND p.is_active = true AND al.is_active = true;

  RETURN COALESCE(access_level_name IN ('super_admin', 'contratante'), false);
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.get_user_company_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT company_id 
  FROM public.user_companies 
  WHERE user_id = (SELECT auth.uid())
    AND is_active = true 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_user_id uuid DEFAULT NULL::uuid, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_event_data jsonb DEFAULT '{}'::jsonb, p_risk_level text DEFAULT 'low'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.create_audit_log(p_company_id uuid, p_action text, p_resource_type text, p_resource_id text DEFAULT NULL::text, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_severity text DEFAULT 'info'::text, p_status text DEFAULT 'success'::text, p_details jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Create CSRF tokens table for server-side validation
CREATE TABLE IF NOT EXISTS public.csrf_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '1 hour'),
  used_at timestamp with time zone,
  ip_address inet,
  user_agent text
);

-- Enable RLS on CSRF tokens
ALTER TABLE public.csrf_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for CSRF tokens
CREATE POLICY "Users can only access their own CSRF tokens" 
ON public.csrf_tokens 
FOR ALL 
USING (auth.uid() = user_id);

-- Function to generate and store CSRF token
CREATE OR REPLACE FUNCTION public.generate_csrf_token(p_session_id text DEFAULT NULL, p_ip_address inet DEFAULT NULL, p_user_agent text DEFAULT NULL)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_token text;
  current_user_id uuid := auth.uid();
BEGIN
  -- Generate cryptographically secure token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Clean up expired tokens for this user
  DELETE FROM public.csrf_tokens 
  WHERE user_id = current_user_id 
    AND (expires_at < now() OR used_at IS NOT NULL);
  
  -- Insert new token
  INSERT INTO public.csrf_tokens (
    token,
    user_id,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    new_token,
    current_user_id,
    p_session_id,
    p_ip_address,
    p_user_agent
  );
  
  RETURN new_token;
END;
$function$;

-- Function to validate CSRF token
CREATE OR REPLACE FUNCTION public.validate_csrf_token(p_token text, p_ip_address inet DEFAULT NULL, p_user_agent text DEFAULT NULL)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  token_record record;
  current_user_id uuid := auth.uid();
BEGIN
  -- Find valid token
  SELECT * INTO token_record
  FROM public.csrf_tokens
  WHERE token = p_token
    AND user_id = current_user_id
    AND expires_at > now()
    AND used_at IS NULL;
  
  IF NOT FOUND THEN
    -- Log invalid token attempt
    PERFORM log_security_event(
      'csrf_token_validation_failed',
      current_user_id,
      p_ip_address,
      p_user_agent,
      jsonb_build_object('token_prefix', substring(p_token from 1 for 8)),
      'medium'
    );
    RETURN false;
  END IF;
  
  -- Mark token as used
  UPDATE public.csrf_tokens
  SET used_at = now()
  WHERE id = token_record.id;
  
  -- Log successful validation
  PERFORM log_security_event(
    'csrf_token_validated',
    current_user_id,
    p_ip_address,
    p_user_agent,
    jsonb_build_object('token_id', token_record.id),
    'low'
  );
  
  RETURN true;
END;
$function$;

-- Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP, user_id, or combination
  action_type text NOT NULL, -- login, api_call, form_submission, etc.
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS and create index
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON public.rate_limits(identifier, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);

-- RLS policy for rate limits (only super admins can view)
CREATE POLICY "Super admins can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (is_super_admin());

-- Function to check and enforce rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action_type text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15, p_block_minutes integer DEFAULT 60)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rate_record record;
  is_blocked boolean := false;
  attempts_remaining integer;
  reset_time timestamp with time zone;
BEGIN
  -- Clean up old records
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '24 hours';
  
  -- Check current rate limit record
  SELECT * INTO rate_record
  FROM public.rate_limits
  WHERE identifier = p_identifier 
    AND action_type = p_action_type
    AND window_start > now() - (p_window_minutes || ' minutes')::interval;
  
  -- Check if currently blocked
  IF rate_record.blocked_until IS NOT NULL AND rate_record.blocked_until > now() THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'attempts_remaining', 0,
      'reset_at', rate_record.blocked_until,
      'reason', 'Rate limit exceeded - temporarily blocked'
    );
  END IF;
  
  -- If no recent record, create new one
  IF rate_record IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action_type, attempts)
    VALUES (p_identifier, p_action_type, 1);
    
    RETURN jsonb_build_object(
      'allowed', true,
      'blocked', false,
      'attempts_remaining', p_max_attempts - 1,
      'reset_at', now() + (p_window_minutes || ' minutes')::interval
    );
  END IF;
  
  -- Check if limit exceeded
  IF rate_record.attempts >= p_max_attempts THEN
    -- Block the identifier
    UPDATE public.rate_limits
    SET blocked_until = now() + (p_block_minutes || ' minutes')::interval,
        updated_at = now()
    WHERE id = rate_record.id;
    
    -- Log rate limit violation
    PERFORM log_security_event(
      'rate_limit_exceeded',
      auth.uid(),
      null,
      null,
      jsonb_build_object(
        'identifier', p_identifier,
        'action_type', p_action_type,
        'attempts', rate_record.attempts,
        'max_attempts', p_max_attempts
      ),
      'high'
    );
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked', true,
      'attempts_remaining', 0,
      'reset_at', now() + (p_block_minutes || ' minutes')::interval,
      'reason', 'Rate limit exceeded'
    );
  END IF;
  
  -- Increment attempts
  UPDATE public.rate_limits
  SET attempts = attempts + 1,
      updated_at = now()
  WHERE id = rate_record.id;
  
  attempts_remaining := p_max_attempts - (rate_record.attempts + 1);
  reset_time := rate_record.window_start + (p_window_minutes || ' minutes')::interval;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'blocked', false,
    'attempts_remaining', attempts_remaining,
    'reset_at', reset_time
  );
END;
$function$;