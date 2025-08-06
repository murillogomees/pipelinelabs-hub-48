-- Fix infinite recursion in user_companies RLS policies
-- First drop all existing policies
DROP POLICY IF EXISTS "Super admins can view all user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Users can view their own company associations" ON public.user_companies;
DROP POLICY IF EXISTS "Contratantes can manage user companies in their company" ON public.user_companies;
DROP POLICY IF EXISTS "Super admins can insert user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Company contratantes can add users to their company" ON public.user_companies;
DROP POLICY IF EXISTS "Super admins can update user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Company contratantes can update user companies in their company" ON public.user_companies;
DROP POLICY IF EXISTS "Super admins can delete user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Company contratantes can remove users from their company" ON public.user_companies;

-- Now create simple, non-recursive policies
CREATE POLICY "user_companies_select_policy" ON public.user_companies
FOR SELECT USING (
  -- User can see their own associations
  user_id = auth.uid()
  OR
  -- Or if they have super_admin access level
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = auth.uid() 
    AND al.name = 'super_admin'
    AND p.is_active = true
    AND al.is_active = true
  )
);

CREATE POLICY "user_companies_insert_policy" ON public.user_companies
FOR INSERT WITH CHECK (
  -- Super admins can insert
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = auth.uid() 
    AND al.name = 'super_admin'
    AND p.is_active = true
    AND al.is_active = true
  )
  OR
  -- Users can add themselves to companies (for registration)
  user_id = auth.uid()
);

CREATE POLICY "user_companies_update_policy" ON public.user_companies
FOR UPDATE USING (
  -- Super admins can update
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = auth.uid() 
    AND al.name = 'super_admin'
    AND p.is_active = true
    AND al.is_active = true
  )
  OR
  -- Contratantes can update users in their company
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = auth.uid() 
    AND al.name = 'contratante'
    AND p.company_id = user_companies.company_id
    AND p.is_active = true
    AND al.is_active = true
  )
);

CREATE POLICY "user_companies_delete_policy" ON public.user_companies
FOR DELETE USING (
  -- Super admins can delete
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = auth.uid() 
    AND al.name = 'super_admin'
    AND p.is_active = true
    AND al.is_active = true
  )
);