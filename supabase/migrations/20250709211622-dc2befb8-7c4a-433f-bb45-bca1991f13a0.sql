-- Fix infinite recursion in user_companies RLS policies
-- Create security definer function to check if current user is admin

-- First, create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_companies 
    WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can insert user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Admins can manage user companies" ON public.user_companies;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can insert user companies" 
ON public.user_companies 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can manage user companies" 
ON public.user_companies 
FOR ALL 
TO authenticated
USING (public.is_current_user_admin());

-- Also update the existing admin policies on profiles table to use the same function
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (public.is_current_user_admin());

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.is_current_user_admin());