-- Security Fix Phase 2: Fix remaining search path issues and additional security

-- Fix all remaining functions with proper search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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

CREATE OR REPLACE FUNCTION public.check_request()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_result boolean := false;
BEGIN
    -- Add your function logic
    -- Example: Check some condition
    IF EXISTS (SELECT 1 FROM public.companies WHERE id IS NOT NULL) THEN
        v_result := true;
    END IF;

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error or handle it appropriately
        RAISE WARNING 'Error in check_request: %', SQLERRM;
        RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clean_document_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Limpar documento removendo caracteres especiais
  IF NEW.document IS NOT NULL THEN
    NEW.document := REGEXP_REPLACE(NEW.document, '[^0-9]', '', 'g');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add additional security functions
CREATE OR REPLACE FUNCTION public.validate_admin_action(p_action text, p_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Create function to validate sensitive operations
CREATE OR REPLACE FUNCTION public.validate_sensitive_operation(
  p_operation text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Create function to cleanup old security logs
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only super admins can run cleanup
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Only super admins can cleanup security logs';
  END IF;
  
  -- Delete logs older than 1 year
  DELETE FROM public.security_audit_logs 
  WHERE created_at < now() - interval '1 year';
  
  -- Delete rate limit records older than 24 hours
  DELETE FROM public.rate_limits 
  WHERE created_at < now() - interval '24 hours';
  
  -- Log the cleanup
  PERFORM log_security_event(
    'security_logs_cleanup',
    auth.uid(),
    NULL,
    NULL,
    jsonb_build_object('timestamp', now()),
    'low'
  );
END;
$function$;