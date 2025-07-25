-- Check if stripe_config table exists, if not create it
CREATE TABLE IF NOT EXISTS public.stripe_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  stripe_publishable_key TEXT,
  stripe_secret_key_encrypted TEXT,
  stripe_webhook_secret_encrypted TEXT,
  default_currency TEXT DEFAULT 'brl',
  test_mode BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can manage stripe config" ON public.stripe_config;
DROP POLICY IF EXISTS "Companies can view their stripe config" ON public.stripe_config;
DROP POLICY IF EXISTS "stripe_config_insert_policy" ON public.stripe_config;
DROP POLICY IF EXISTS "stripe_config_update_policy" ON public.stripe_config;
DROP POLICY IF EXISTS "stripe_config_select_policy" ON public.stripe_config;

-- Create proper RLS policies for stripe_config
CREATE POLICY "Super admins can manage all stripe config" 
ON public.stripe_config 
FOR ALL 
USING (is_super_admin());

CREATE POLICY "Companies can view their own stripe config" 
ON public.stripe_config 
FOR SELECT 
USING (company_id IS NULL OR can_access_company_data(company_id));

CREATE POLICY "Super admins can insert stripe config" 
ON public.stripe_config 
FOR INSERT 
WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can update stripe config" 
ON public.stripe_config 
FOR UPDATE 
USING (is_super_admin());