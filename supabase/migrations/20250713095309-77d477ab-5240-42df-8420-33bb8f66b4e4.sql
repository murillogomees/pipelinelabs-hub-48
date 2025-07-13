-- Fix critical role privilege escalation vulnerability
-- Users should not be able to modify their own role or company associations

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their company associations" ON public.user_companies;

-- Create secure policies that prevent self-modification of roles
CREATE POLICY "Users can view their own company associations" 
ON public.user_companies 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Only admins can modify user company associations, but not their own
CREATE POLICY "Admins can modify other users companies" 
ON public.user_companies 
FOR UPDATE 
TO authenticated
USING (
  is_current_user_admin() AND 
  user_id != auth.uid()  -- Prevent admins from modifying their own role
);

-- Only admins can delete user company associations, but not their own
CREATE POLICY "Admins can delete other users companies" 
ON public.user_companies 
FOR DELETE 
TO authenticated
USING (
  is_current_user_admin() AND 
  user_id != auth.uid()  -- Prevent admins from deleting their own association
);

-- Create audit log table for tracking sensitive changes
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  company_id UUID REFERENCES public.companies(id)
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs for their company
CREATE POLICY "Admins can view company audit logs" 
ON public.audit_log 
FOR SELECT 
TO authenticated
USING (is_current_user_admin() AND company_id = get_user_company_id());

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_user_companies_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role changes
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.audit_log (
      table_name, 
      operation, 
      old_values, 
      new_values, 
      changed_by, 
      company_id
    ) VALUES (
      'user_companies',
      'role_change',
      jsonb_build_object('user_id', OLD.user_id, 'old_role', OLD.role),
      jsonb_build_object('user_id', NEW.user_id, 'new_role', NEW.role),
      auth.uid(),
      NEW.company_id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
CREATE TRIGGER audit_user_companies_trigger
  AFTER UPDATE ON public.user_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_user_companies_changes();