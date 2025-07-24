-- Create company_marketplace_configs table if it doesn't exist (for 406 error fix)
CREATE TABLE IF NOT EXISTS public.company_marketplace_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  global_config JSONB DEFAULT '{}',
  webhook_config JSONB DEFAULT '{}',
  api_limits JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id, channel_name)
);

-- Enable RLS
ALTER TABLE public.company_marketplace_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_marketplace_configs
CREATE POLICY "Companies can view their configs" 
ON public.company_marketplace_configs 
FOR SELECT 
USING (can_access_company_data(company_id));

CREATE POLICY "Company admins can create configs" 
ON public.company_marketplace_configs 
FOR INSERT 
WITH CHECK (can_manage_company_data(company_id));

CREATE POLICY "Company admins can update configs" 
ON public.company_marketplace_configs 
FOR UPDATE 
USING (can_manage_company_data(company_id));

CREATE POLICY "Super admins can manage all configs" 
ON public.company_marketplace_configs 
FOR ALL 
USING (is_super_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_company_marketplace_configs_updated_at
  BEFORE UPDATE ON public.company_marketplace_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();