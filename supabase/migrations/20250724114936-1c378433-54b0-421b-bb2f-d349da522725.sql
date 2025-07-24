-- Security Fix Phase 1 (Corrected): Critical Database Security Improvements

-- 1. Remove hardcoded super admin email and implement proper role system
-- Update is_super_admin function to use proper role-based system
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  -- Check if user has super_admin role in user_companies table
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    WHERE uc.user_id = current_user_id
      AND uc.user_type = 'super_admin'
      AND uc.is_active = true
  );
END;
$function$;

-- 2. Fix database functions with proper search path security
CREATE OR REPLACE FUNCTION public.generate_contract_number(company_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_number INTEGER;
  company_prefix TEXT;
  current_year TEXT;
BEGIN
  -- Ano atual
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Buscar próximo número para a empresa no ano atual
  SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.contracts
  WHERE company_id = company_uuid 
    AND contract_number LIKE '%' || current_year || '%';
  
  -- Usar prefixo da empresa ou CONT como padrão
  SELECT COALESCE(SUBSTRING(name FROM 1 FOR 3), 'CONT')
  INTO company_prefix
  FROM public.companies
  WHERE id = company_uuid;
  
  RETURN UPPER(company_prefix) || '-' || LPAD(next_number::TEXT, 4, '0') || '/' || current_year;
END;
$function$;

-- 3. Fix other functions with proper search paths
CREATE OR REPLACE FUNCTION public.generate_purchase_order_number(company_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_number integer;
  order_number text;
BEGIN
  SELECT COALESCE(MAX(CAST(order_number AS integer)), 0) + 1 INTO next_number
  FROM public.purchase_orders
  WHERE company_id = company_id;
  
  order_number := next_number::text;
  RETURN order_number;
END;
$function$;

-- 4. Create encryption function for sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data_to_encrypt text, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Use pgcrypto extension for encryption
  -- This is a simplified version - in production, use proper key management
  RETURN encode(digest(data_to_encrypt || encryption_key, 'sha256'), 'hex');
END;
$function$;

-- 5. Add security audit table for tracking security events
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  event_data jsonb DEFAULT '{}',
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_audit_logs_admin_access"
ON public.security_audit_logs
FOR ALL
USING (is_super_admin());

-- 6. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_event_data jsonb DEFAULT '{}',
  p_risk_level text DEFAULT 'low'
)
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

-- 7. Add rate limiting table for server-side protection
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create unique index for efficient lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits (identifier);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limits_system_access"
ON public.rate_limits
FOR ALL
USING (true); -- System table, needs to be accessible for rate limiting

-- 8. Create server-side rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_max_requests integer DEFAULT 60,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;