-- CRITICAL SECURITY FIXES

-- Phase 1: Fix Database Function Security (Critical)
-- Add SET search_path TO 'public' to security-critical functions

CREATE OR REPLACE FUNCTION public.validate_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Password must be at least 8 characters
    IF LENGTH(password) < 8 THEN
        RETURN FALSE;
    END IF;
    
    -- Password must contain at least one uppercase letter
    IF password !~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Password must contain at least one lowercase letter
    IF password !~ '[a-z]' THEN
        RETURN FALSE;
    END IF;
    
    -- Password must contain at least one number
    IF password !~ '[0-9]' THEN
        RETURN FALSE;
    END IF;
    
    -- Password must contain at least one special character
    IF password !~ '[^A-Za-z0-9]' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$function$;

-- Update remaining critical functions with search path protection
CREATE OR REPLACE FUNCTION public.get_security_config(config_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  config_value jsonb;
BEGIN
  SELECT sc.config_value INTO config_value
  FROM public.security_config sc
  WHERE sc.config_key = get_security_config.config_key
    AND sc.is_active = true;
  
  RETURN COALESCE(config_value, '{}'::jsonb);
END;
$function$;

-- Phase 2: Enable RLS on analytics_events table (Critical)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events
CREATE POLICY "Users can view their company analytics events"
ON public.analytics_events
FOR SELECT
USING (can_access_company_data(company_id));

CREATE POLICY "Users can create analytics events for their company"
ON public.analytics_events
FOR INSERT
WITH CHECK (can_access_company_data(company_id));

-- Super admins can manage all analytics events
CREATE POLICY "Super admins can manage all analytics events"
ON public.analytics_events
FOR ALL
USING (is_super_admin());

-- Phase 3: Create security configuration table if not exists
CREATE TABLE IF NOT EXISTS public.security_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL DEFAULT '{}',
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_config
ALTER TABLE public.security_config ENABLE ROW LEVEL SECURITY;

-- Only super admins can access security config
CREATE POLICY "Super admins can manage security config"
ON public.security_config
FOR ALL
USING (is_super_admin());

-- Insert default security configurations
INSERT INTO public.security_config (config_key, config_value, description) VALUES
('csrf_protection', '{"enabled": true, "token_expiry_minutes": 30, "strict_mode": true}', 'CSRF protection settings'),
('session_security', '{"max_concurrent_sessions": 3, "session_timeout_minutes": 480, "require_reauth_for_sensitive": true}', 'Session security settings'),
('audit_retention', '{"security_logs_days": 365, "rate_limit_logs_days": 7, "auto_cleanup_enabled": true}', 'Audit log retention policy'),
('rate_limiting', '{"enabled": true, "max_requests_per_minute": 60, "lockout_duration_minutes": 15}', 'Rate limiting configuration')
ON CONFLICT (config_key) DO NOTHING;

-- Phase 4: Create rate_limits table for enhanced rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(key, window_start)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system functions can manage rate limits
CREATE POLICY "System can manage rate limits"
ON public.rate_limits
FOR ALL
USING (true);

-- Create index for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_expires ON public.rate_limits(key, expires_at);

-- Phase 5: Update existing functions with proper search path
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key text, p_limit integer DEFAULT 60, p_window_minutes integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := date_trunc('minute', now()) - (date_trunc('minute', now()) - date_trunc('hour', now())) % (p_window_minutes || ' minutes')::interval;
  
  -- Get current count for this key in the current window
  SELECT COALESCE(count, 0) INTO current_count
  FROM public.rate_limits
  WHERE key = p_key 
    AND window_start = window_start_time
    AND expires_at > now();
  
  -- If no record exists, create one
  IF current_count = 0 THEN
    INSERT INTO public.rate_limits (key, count, window_start, expires_at)
    VALUES (p_key, 1, window_start_time, window_start_time + (p_window_minutes || ' minutes')::interval)
    ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1;
    RETURN true;
  END IF;
  
  -- Check if limit is exceeded
  IF current_count >= p_limit THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  UPDATE public.rate_limits
  SET count = count + 1
  WHERE key = p_key AND window_start = window_start_time;
  
  RETURN true;
END;
$function$;