-- CRITICAL SECURITY FIXES - Phase 1: RLS Policy Corrections (Fixed)
-- Fix INSERT policies that currently allow unrestricted access

-- Fix the function conflict first
DROP FUNCTION IF EXISTS public.validate_password(text);

-- 1. Fix accounts_payable INSERT policy
DROP POLICY IF EXISTS "Company accounts_payable management" ON public.accounts_payable;
CREATE POLICY "Company accounts_payable management" 
ON public.accounts_payable 
FOR INSERT 
WITH CHECK (
  can_access_company_data(company_id) 
  AND has_specific_permission('financeiro'::text, company_id)
  AND company_id = get_user_company_id()
);

-- 2. Fix accounts_receivable INSERT policy  
DROP POLICY IF EXISTS "Company accounts_receivable management" ON public.accounts_receivable;
CREATE POLICY "Company accounts_receivable management" 
ON public.accounts_receivable 
FOR INSERT 
WITH CHECK (
  can_access_company_data(company_id) 
  AND has_specific_permission('financeiro'::text, company_id)
  AND company_id = get_user_company_id()
);

-- 3. Add missing get_user_company_id function for security
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_uuid uuid;
BEGIN
  SELECT company_id INTO company_uuid
  FROM public.user_companies
  WHERE user_id = auth.uid() 
    AND is_active = true
  LIMIT 1;
  
  RETURN company_uuid;
END;
$$;

-- 4. Fix companies INSERT policy to prevent unauthorized company creation
DROP POLICY IF EXISTS "companies_management_policy" ON public.companies;
CREATE POLICY "companies_management_policy" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  is_super_admin() OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- 5. Create security_config table if not exists
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

-- Only super admins can manage security config
DROP POLICY IF EXISTS "Super admins can manage security config" ON public.security_config;
CREATE POLICY "Super admins can manage security config" 
ON public.security_config 
FOR ALL 
USING (is_super_admin());

-- 6. Create security audit log table for better monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  ip_address inet,
  user_agent text,
  event_data jsonb DEFAULT '{}',
  risk_level text DEFAULT 'low',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_audit_logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view security logs
DROP POLICY IF EXISTS "Super admins can view security logs" ON public.security_audit_logs;
CREATE POLICY "Super admins can view security logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (is_super_admin());

-- System can insert security logs
DROP POLICY IF EXISTS "System can insert security logs" ON public.security_audit_logs;
CREATE POLICY "System can insert security logs" 
ON public.security_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- 7. Update log_security_event function to use the new table
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