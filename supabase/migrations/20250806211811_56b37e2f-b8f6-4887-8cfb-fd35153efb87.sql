-- Fix infinite recursion in RLS policies
-- The issue is that get_user_company_id() function queries user_companies table
-- which has RLS policies that call get_user_company_id(), creating infinite recursion

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Company user_companies access" ON public.user_companies;
DROP POLICY IF EXISTS "Company user_companies management" ON public.user_companies;
DROP POLICY IF EXISTS "auto_create_user_company_on_signup" ON public.user_companies;

-- Create new safe policies that don't cause recursion
CREATE POLICY "Users can access their own user_companies"
ON public.user_companies
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own user_companies" 
ON public.user_companies
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow system to create user_companies during signup
CREATE POLICY "System can create user_companies during signup"
ON public.user_companies  
FOR INSERT
WITH CHECK (true);

-- Update get_user_company_id function to be simpler and avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT company_id 
  FROM public.user_companies
  WHERE user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
$$;

-- Also update is_contratante function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_contratante(company_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    JOIN public.profiles p ON uc.user_id = p.user_id
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE uc.user_id = auth.uid() 
      AND (company_uuid IS NULL OR uc.company_id = company_uuid)
      AND al.name IN ('super_admin', 'contratante')
      AND uc.is_active = true
      AND p.is_active = true
      AND al.is_active = true
  );
$$;

-- Update is_super_admin function to avoid recursion  
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = auth.uid() 
      AND al.name = 'super_admin'
      AND p.is_active = true
      AND al.is_active = true
  );
$$;