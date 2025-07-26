
-- Phase 1: Critical Database Security Fixes

-- 1. Fix Function Search Path Issues for Security Definer Functions
-- This prevents privilege escalation and function hijacking attacks

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  -- Se não há usuário logado, retornar false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se o usuário tem role super_admin na tabela user_companies
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    WHERE uc.user_id = current_user_id
      AND uc.user_type = 'super_admin'
      AND uc.is_active = true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_contratante(company_uuid uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.is_operador(company_uuid uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_type()
 RETURNS user_type
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT user_type 
  FROM public.user_companies 
  WHERE user_id = auth.uid() 
    AND is_active = true 
  LIMIT 1;
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

-- 2. Add RLS Policies to Foreign Tables to prevent API access bypass

-- Enable RLS on Stripe foreign tables
ALTER TABLE public.customer_stripe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices_stripe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_stripe ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies for Stripe tables (super admin only)
CREATE POLICY "Super admins only can access customer_stripe" 
  ON public.customer_stripe 
  FOR ALL 
  USING (is_super_admin());

CREATE POLICY "Super admins only can access invoices_stripe" 
  ON public.invoices_stripe 
  FOR ALL 
  USING (is_super_admin());

CREATE POLICY "Super admins only can access checkout_stripe" 
  ON public.checkout_stripe 
  FOR ALL 
  USING (is_super_admin());

-- 3. Create encryption functions for sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(
  plaintext TEXT,
  encryption_key TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use pgcrypto extension for proper encryption
  -- This is a simplified version - in production, use proper key derivation
  RETURN encode(
    encrypt(
      plaintext::bytea,
      digest(encryption_key, 'sha256'),
      'aes'
    ),
    'base64'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_field(
  ciphertext TEXT,
  encryption_key TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(ciphertext, 'base64'),
      digest(encryption_key, 'sha256'),
      'aes'
    ),
    'UTF8'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL; -- Return NULL for invalid decryption
END;
$$;

-- 4. Enhanced password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
  score INTEGER := 0;
  feedback TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check password length
  IF LENGTH(password) >= 12 THEN
    score := score + 2;
  ELSIF LENGTH(password) >= 8 THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Use at least 8 characters (12+ recommended)');
  END IF;
  
  -- Check for lowercase letters
  IF password ~ '[a-z]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Include lowercase letters');
  END IF;
  
  -- Check for uppercase letters
  IF password ~ '[A-Z]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Include uppercase letters');
  END IF;
  
  -- Check for numbers
  IF password ~ '[0-9]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Include numbers');
  END IF;
  
  -- Check for special characters
  IF password ~ '[^A-Za-z0-9]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Include special characters');
  END IF;
  
  -- Check for common patterns
  IF password ~* '(password|123456|qwerty|admin|user|login)' THEN
    score := score - 2;
    feedback := array_append(feedback, 'Avoid common passwords');
  END IF;
  
  -- Check for repeated characters
  IF password ~ '(.)\1{2,}' THEN
    score := score - 1;
    feedback := array_append(feedback, 'Avoid repeated characters');
  END IF;
  
  result := jsonb_build_object(
    'score', GREATEST(score, 0),
    'max_score', 6,
    'strength', CASE 
      WHEN score >= 5 THEN 'very_strong'
      WHEN score >= 4 THEN 'strong'
      WHEN score >= 3 THEN 'medium'
      WHEN score >= 2 THEN 'weak'
      ELSE 'very_weak'
    END,
    'is_valid', score >= 3,
    'feedback', to_jsonb(feedback)
  );
  
  RETURN result;
END;
$$;

-- 5. Enhanced security event logging
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_event_type text,
  p_user_id uuid DEFAULT NULL::uuid,
  p_ip_address inet DEFAULT NULL::inet,
  p_user_agent text DEFAULT NULL::text,
  p_event_data jsonb DEFAULT '{}'::jsonb,
  p_risk_level text DEFAULT 'low'::text,
  p_company_id uuid DEFAULT NULL::uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id uuid;
  current_user_id uuid;
  current_company_id uuid;
BEGIN
  current_user_id := COALESCE(p_user_id, auth.uid());
  current_company_id := COALESCE(p_company_id, get_user_company_id());
  
  INSERT INTO public.security_audit_logs (
    event_type,
    user_id,
    ip_address,
    user_agent,
    event_data,
    risk_level
  ) VALUES (
    p_event_type,
    current_user_id,
    p_ip_address,
    p_user_agent,
    p_event_data || jsonb_build_object(
      'company_id', current_company_id,
      'timestamp', extract(epoch from now()),
      'session_id', encode(gen_random_bytes(16), 'hex')
    ),
    p_risk_level
  ) RETURNING id INTO log_id;
  
  -- Create alert for high/critical risk events
  IF p_risk_level IN ('high', 'critical') THEN
    PERFORM create_system_alert(
      'Security Event: ' || p_event_type,
      'High risk security event detected: ' || p_event_type,
      jsonb_build_object(
        'log_id', log_id,
        'risk_level', p_risk_level,
        'user_id', current_user_id,
        'event_data', p_event_data
      )
    );
  END IF;
  
  RETURN log_id;
END;
$$;

-- 6. Create secure credential storage table
CREATE TABLE IF NOT EXISTS public.secure_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  credential_type text NOT NULL,
  credential_name text NOT NULL,
  encrypted_value text NOT NULL,
  encryption_method text NOT NULL DEFAULT 'aes-256',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  UNIQUE(company_id, credential_type, credential_name)
);

-- Enable RLS on secure credentials
ALTER TABLE public.secure_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for secure credentials
CREATE POLICY "Company admins can manage their credentials"
  ON public.secure_credentials
  FOR ALL
  USING (can_manage_company_data(company_id));

CREATE POLICY "Super admins can view all credentials"
  ON public.secure_credentials
  FOR SELECT
  USING (is_super_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_secure_credentials_updated_at
    BEFORE UPDATE ON public.secure_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Create security configuration table
CREATE TABLE IF NOT EXISTS public.security_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL DEFAULT '{}',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS on security config
ALTER TABLE public.security_config ENABLE ROW LEVEL SECURITY;

-- Create policy for security config
CREATE POLICY "Super admins can manage security config"
  ON public.security_config
  FOR ALL
  USING (is_super_admin());

-- Insert default security configurations
INSERT INTO public.security_config (config_key, config_value, description) VALUES
('password_policy', '{
  "min_length": 8,
  "require_uppercase": true,
  "require_lowercase": true,
  "require_numbers": true,
  "require_special": true,
  "max_age_days": 90,
  "prevent_reuse": 5
}', 'Password policy configuration'),
('session_settings', '{
  "max_session_duration": 28800,
  "idle_timeout": 3600,
  "require_2fa_for_admin": false,
  "concurrent_sessions_limit": 3
}', 'Session management settings'),
('rate_limiting', '{
  "login_attempts": {"max": 5, "window": 900},
  "api_requests": {"max": 1000, "window": 3600},
  "sensitive_operations": {"max": 10, "window": 3600}
}', 'Rate limiting configuration'),
('audit_retention', '{
  "security_logs_days": 365,
  "audit_logs_days": 2555,
  "rate_limit_logs_days": 7,
  "auto_cleanup_enabled": true
}', 'Audit log retention policy');

-- Add trigger for security config
CREATE TRIGGER update_security_config_updated_at
    BEFORE UPDATE ON public.security_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
