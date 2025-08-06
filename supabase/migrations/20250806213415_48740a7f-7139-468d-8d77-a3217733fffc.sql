-- Fix the infinite recursion issue completely
-- Drop ALL existing policies on user_companies table

DROP POLICY IF EXISTS "Users can access their own user_companies" ON public.user_companies;
DROP POLICY IF EXISTS "Users can manage their own user_companies" ON public.user_companies;
DROP POLICY IF EXISTS "System can create user_companies during signup" ON public.user_companies;
DROP POLICY IF EXISTS "Company user_companies access" ON public.user_companies;
DROP POLICY IF EXISTS "Company user_companies management" ON public.user_companies;
DROP POLICY IF EXISTS "auto_create_user_company_on_signup" ON public.user_companies;

-- Create simple, non-recursive policies
CREATE POLICY "user_companies_select_policy"
ON public.user_companies
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "user_companies_insert_policy" 
ON public.user_companies
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_companies_update_policy"
ON public.user_companies  
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_companies_delete_policy"
ON public.user_companies
FOR DELETE
USING (user_id = auth.uid());

-- Update the functions to be simpler and avoid any recursion
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