-- Update RLS policies to allow global Stripe config management by any authenticated user
-- This is for global system configuration, not company-specific

DROP POLICY IF EXISTS "Super admins can insert stripe config" ON public.stripe_config;
DROP POLICY IF EXISTS "Super admins can update stripe config" ON public.stripe_config;

-- Allow authenticated users to manage global Stripe config (company_id IS NULL)
CREATE POLICY "Authenticated users can manage global stripe config" 
ON public.stripe_config 
FOR ALL 
USING (company_id IS NULL OR is_super_admin())
WITH CHECK (company_id IS NULL OR is_super_admin());