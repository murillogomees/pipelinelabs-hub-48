-- Drop and recreate get_user_company_id function to be simpler and avoid recursion
DROP FUNCTION IF EXISTS public.get_user_company_id();

-- Create a simple function that doesn't cause recursion issues
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_uuid uuid;
BEGIN
  -- Simple direct query to user_companies without any policy checks
  SELECT company_id INTO company_uuid
  FROM public.user_companies
  WHERE user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
  
  RETURN company_uuid;
END;
$$;

-- Also update has_specific_permission if it exists to avoid recursion
DROP FUNCTION IF EXISTS public.has_specific_permission(text, uuid);

-- Create a simple has_specific_permission function
CREATE OR REPLACE FUNCTION public.has_specific_permission(permission_name text, company_uuid uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  has_perm boolean := false;
BEGIN
  -- Super admin has all permissions
  IF is_super_admin() THEN
    RETURN true;
  END IF;
  
  -- Check user permissions through profiles and access_levels
  SELECT COALESCE(
    (al.permissions ->> permission_name)::boolean, 
    false
  ) INTO has_perm
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = auth.uid()
    AND p.is_active = true
    AND al.is_active = true
    AND (company_uuid IS NULL OR p.company_id = company_uuid);
  
  RETURN COALESCE(has_perm, false);
END;
$$;