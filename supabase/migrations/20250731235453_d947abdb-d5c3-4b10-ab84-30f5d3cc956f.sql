-- CRITICAL SECURITY FIXES - Phase 1

-- Drop existing function to recreate with proper security
DROP FUNCTION IF EXISTS public.get_security_config(text);

-- Create security configuration table if not exists
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
DROP POLICY IF EXISTS "Super admins can manage security config" ON public.security_config;
CREATE POLICY "Super admins can manage security config"
ON public.security_config
FOR ALL
USING (is_super_admin());

-- Create secure function with proper search path
CREATE OR REPLACE FUNCTION public.get_security_config(p_config_key text)
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
  WHERE sc.config_key = p_config_key
    AND sc.is_active = true;
  
  RETURN COALESCE(config_value, '{}'::jsonb);
END;
$function$;

-- Enable RLS on analytics_events table (Critical)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events
DROP POLICY IF EXISTS "Users can view their company analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can create analytics events for their company" ON public.analytics_events;
DROP POLICY IF EXISTS "Super admins can manage all analytics events" ON public.analytics_events;

CREATE POLICY "Users can view their company analytics events"
ON public.analytics_events
FOR SELECT
USING (can_access_company_data(company_id));

CREATE POLICY "Users can create analytics events for their company"
ON public.analytics_events
FOR INSERT
WITH CHECK (can_access_company_data(company_id));

CREATE POLICY "Super admins can manage all analytics events"
ON public.analytics_events
FOR ALL
USING (is_super_admin());

-- Insert default security configurations
INSERT INTO public.security_config (config_key, config_value, description) VALUES
('csrf_protection', '{"enabled": true, "token_expiry_minutes": 30, "strict_mode": true}', 'CSRF protection settings'),
('session_security', '{"max_concurrent_sessions": 3, "session_timeout_minutes": 480, "require_reauth_for_sensitive": true}', 'Session security settings'),
('audit_retention', '{"security_logs_days": 365, "rate_limit_logs_days": 7, "auto_cleanup_enabled": true}', 'Audit log retention policy'),
('rate_limiting', '{"enabled": true, "max_requests_per_minute": 60, "lockout_duration_minutes": 15}', 'Rate limiting configuration')
ON CONFLICT (config_key) DO NOTHING;