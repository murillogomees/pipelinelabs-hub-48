-- Drop ALL policies on user_companies table first
DROP POLICY IF EXISTS "Super admins can manage user companies" ON public.user_companies;
DROP POLICY IF EXISTS "System can create user_companies during signup" ON public.user_companies;
DROP POLICY IF EXISTS "Users can access their own user_companies" ON public.user_companies;
DROP POLICY IF EXISTS "Users can manage their own user_companies" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_access_policy" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_delete_policy" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_insert_policy" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_select_policy" ON public.user_companies;
DROP POLICY IF EXISTS "user_companies_update_policy" ON public.user_companies;

-- Disable RLS temporarily to clean up
ALTER TABLE public.user_companies DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Create clean, simple policies
CREATE POLICY "simple_user_companies_select"
ON public.user_companies
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "simple_user_companies_insert" 
ON public.user_companies
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "simple_user_companies_update"
ON public.user_companies  
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "simple_user_companies_delete"
ON public.user_companies
FOR DELETE
USING (user_id = auth.uid());