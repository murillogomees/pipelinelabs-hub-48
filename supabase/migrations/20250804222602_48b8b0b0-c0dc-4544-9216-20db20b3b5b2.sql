-- CRITICAL SECURITY FIXES - Phase 1: RLS Policy Corrections
-- Fix INSERT policies that currently allow unrestricted access

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

-- 3. Fix auditoria_config INSERT policy
DROP POLICY IF EXISTS "Company auditoria_config management" ON public.auditoria_config;
CREATE POLICY "Company auditoria_config management" 
ON public.auditoria_config 
FOR INSERT 
WITH CHECK (
  can_manage_company_data(company_id)
  AND company_id = get_user_company_id()
);

-- 4. Fix auditoria_historico INSERT policy
DROP POLICY IF EXISTS "Company auditoria_historico management" ON public.auditoria_historico;
CREATE POLICY "Company auditoria_historico management" 
ON public.auditoria_historico 
FOR INSERT 
WITH CHECK (
  can_access_company_data(company_id) 
  AND has_specific_permission('admin'::text, company_id)
  AND company_id = get_user_company_id()
);

-- 5. Fix bank_accounts INSERT policy
DROP POLICY IF EXISTS "Company bank_accounts management" ON public.bank_accounts;
CREATE POLICY "Company bank_accounts management" 
ON public.bank_accounts 
FOR INSERT 
WITH CHECK (
  can_access_company_data(company_id) 
  AND has_specific_permission('financeiro'::text, company_id)
  AND company_id = get_user_company_id()
);

-- 6. Fix contracts INSERT policy
DROP POLICY IF EXISTS "Company contracts management" ON public.contracts;
CREATE POLICY "Company contracts management" 
ON public.contracts 
FOR INSERT 
WITH CHECK (
  can_access_company_data(company_id) 
  AND has_specific_permission('contratos'::text, company_id)
  AND company_id = get_user_company_id()
);

-- 7. Fix cost_centers INSERT policy
DROP POLICY IF EXISTS "Company cost_centers management" ON public.cost_centers;
CREATE POLICY "Company cost_centers management" 
ON public.cost_centers 
FOR INSERT 
WITH CHECK (
  can_access_company_data(company_id) 
  AND has_specific_permission('financeiro'::text, company_id)
  AND company_id = get_user_company_id()
);

-- 8. Fix financial_categories INSERT policy
DROP POLICY IF EXISTS "Company financial_categories management" ON public.financial_categories;
CREATE POLICY "Company financial_categories management" 
ON public.financial_categories 
FOR INSERT 
WITH CHECK (
  can_access_company_data(company_id) 
  AND has_specific_permission('financeiro'::text, company_id)
  AND company_id = get_user_company_id()
);

-- 9. Fix financial_transactions INSERT policy
DROP POLICY IF EXISTS "Company financial_transactions management" ON public.financial_transactions;
CREATE POLICY "Company financial_transactions management" 
ON public.financial_transactions 
FOR INSERT 
WITH CHECK (
  can_access_company_data(company_id) 
  AND has_specific_permission('financeiro'::text, company_id)
  AND company_id = get_user_company_id()
);

-- 10. Add missing get_user_company_id function for security
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

-- 11. Fix companies INSERT policy to prevent unauthorized company creation
DROP POLICY IF EXISTS "companies_management_policy" ON public.companies;
CREATE POLICY "companies_management_policy" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  is_super_admin() OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- 12. Add password strength validation trigger
CREATE OR REPLACE FUNCTION public.validate_password(password_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This is a placeholder - actual password validation should be done on signup
  -- Password policies should be enforced in the application layer
  RETURN true;
END;
$$;

-- 13. Fix security_config table access
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
CREATE POLICY "Super admins can manage security config" 
ON public.security_config 
FOR ALL 
USING (is_super_admin());

-- 14. Create security audit log table for better monitoring
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
CREATE POLICY "Super admins can view security logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (is_super_admin());

-- System can insert security logs
CREATE POLICY "System can insert security logs" 
ON public.security_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- 15. Update log_security_event function to use the new table
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