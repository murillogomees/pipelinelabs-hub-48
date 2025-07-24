-- Security Fix Phase 3: Create initial super admin and final security setup

-- Create function to setup initial super admin (one-time use)
CREATE OR REPLACE FUNCTION public.setup_initial_super_admin(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user_id uuid;
  pipeline_company_id uuid;
BEGIN
  -- Get the user ID for the specified email
  SELECT user_id INTO admin_user_id
  FROM public.profiles
  WHERE email = p_email
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_email;
  END IF;
  
  -- Get Pipeline Labs company ID
  SELECT id INTO pipeline_company_id
  FROM public.companies
  WHERE name = 'Pipeline Labs'
  LIMIT 1;
  
  -- If Pipeline Labs doesn't exist, create it
  IF pipeline_company_id IS NULL THEN
    INSERT INTO public.companies (name, document, email)
    VALUES ('Pipeline Labs', '00000000000191', 'admin@pipelinelabs.app')
    RETURNING id INTO pipeline_company_id;
  END IF;
  
  -- Create or update user_companies record for super admin
  INSERT INTO public.user_companies (
    user_id,
    company_id,
    user_type,
    is_active,
    permissions,
    specific_permissions
  ) VALUES (
    admin_user_id,
    pipeline_company_id,
    'super_admin',
    true,
    jsonb_build_object(
      'dashboard', true,
      'vendas', true,
      'produtos', true,
      'clientes', true,
      'fornecedores', true,
      'estoque', true,
      'financeiro', true,
      'relatorios', true,
      'configuracoes', true,
      'admin', true,
      'usuarios', true,
      'empresas', true,
      'sistema', true,
      'seguranca', true,
      'notas_fiscais', true,
      'contratos', true,
      'producao', true,
      'compras', true,
      'integracoes', true
    ),
    jsonb_build_object(
      'super_admin_access', true,
      'system_management', true,
      'security_monitoring', true,
      'user_management', true,
      'company_management', true
    )
  )
  ON CONFLICT (user_id, company_id) 
  DO UPDATE SET
    user_type = 'super_admin',
    is_active = true,
    permissions = EXCLUDED.permissions,
    specific_permissions = EXCLUDED.specific_permissions,
    updated_at = now();
  
  -- Log the super admin setup
  PERFORM log_security_event(
    'super_admin_setup',
    admin_user_id,
    NULL,
    NULL,
    jsonb_build_object('email', p_email, 'company_id', pipeline_company_id),
    'medium'
  );
  
  RETURN admin_user_id;
END;
$function$;

-- Create security configuration table
CREATE TABLE IF NOT EXISTS public.security_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL DEFAULT '{}',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.security_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_config_admin_access"
ON public.security_config
FOR ALL
USING (is_super_admin());

-- Insert default security configurations
INSERT INTO public.security_config (config_key, config_value, description) VALUES
('rate_limiting', '{"enabled": true, "default_max_requests": 60, "default_window_minutes": 60, "strict_endpoints": ["/api/auth", "/api/admin"]}', 'Rate limiting configuration'),
('password_policy', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special": true, "check_breached": true}', 'Password policy requirements'),
('session_security', '{"max_session_duration": 86400, "force_refresh_interval": 3600, "logout_on_suspicious_activity": true}', 'Session security settings'),
('audit_retention', '{"security_logs_days": 365, "rate_limit_logs_days": 7, "auto_cleanup_enabled": true}', 'Audit log retention policy'),
('mfa_settings', '{"enabled": false, "required_for_admins": true, "methods": ["totp", "sms"]}', 'Multi-factor authentication settings')
ON CONFLICT (config_key) DO NOTHING;

-- Create function to get security config
CREATE OR REPLACE FUNCTION public.get_security_config(p_config_key text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  config_value jsonb;
BEGIN
  SELECT config_value INTO config_value
  FROM public.security_config
  WHERE config_key = p_config_key
    AND is_active = true;
  
  RETURN COALESCE(config_value, '{}');
END;
$function$;

-- Create function to update security config (admin only)
CREATE OR REPLACE FUNCTION public.update_security_config(
  p_config_key text,
  p_config_value jsonb,
  p_description text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only super admins can update security config
  IF NOT is_super_admin() THEN
    PERFORM log_security_event(
      'unauthorized_security_config_update',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object('config_key', p_config_key),
      'high'
    );
    RAISE EXCEPTION 'Access denied: Only super admins can update security configuration';
  END IF;
  
  -- Update the configuration
  UPDATE public.security_config
  SET 
    config_value = p_config_value,
    description = COALESCE(p_description, description),
    updated_at = now()
  WHERE config_key = p_config_key;
  
  -- Log the configuration change
  PERFORM log_security_event(
    'security_config_updated',
    auth.uid(),
    NULL,
    NULL,
    jsonb_build_object(
      'config_key', p_config_key,
      'new_value', p_config_value
    ),
    'medium'
  );
  
  RETURN FOUND;
END;
$function$;

-- Create automated security cleanup job function
CREATE OR REPLACE FUNCTION public.automated_security_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  retention_config jsonb;
  security_retention_days integer;
  rate_limit_retention_days integer;
BEGIN
  -- Get retention configuration
  retention_config := get_security_config('audit_retention');
  security_retention_days := COALESCE((retention_config->>'security_logs_days')::integer, 365);
  rate_limit_retention_days := COALESCE((retention_config->>'rate_limit_logs_days')::integer, 7);
  
  -- Only run if auto cleanup is enabled
  IF COALESCE((retention_config->>'auto_cleanup_enabled')::boolean, true) THEN
    -- Clean up old security audit logs
    DELETE FROM public.security_audit_logs
    WHERE created_at < now() - (security_retention_days || ' days')::interval;
    
    -- Clean up old rate limit records
    DELETE FROM public.rate_limits
    WHERE created_at < now() - (rate_limit_retention_days || ' days')::interval;
    
    -- Log the cleanup operation
    PERFORM log_security_event(
      'automated_security_cleanup',
      NULL,
      NULL,
      NULL,
      jsonb_build_object(
        'security_logs_cleaned', security_retention_days,
        'rate_limits_cleaned', rate_limit_retention_days
      ),
      'low'
    );
  END IF;
END;
$function$;