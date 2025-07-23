-- Create stripe_config table for global Stripe configuration
CREATE TABLE public.stripe_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  stripe_publishable_key TEXT,
  stripe_secret_key_encrypted TEXT,
  stripe_webhook_secret_encrypted TEXT,
  default_currency TEXT NOT NULL DEFAULT 'usd',
  test_mode BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;

-- Create policies for stripe_config
CREATE POLICY "Super admins can manage all stripe config" 
ON public.stripe_config 
FOR ALL 
USING (is_super_admin());

CREATE POLICY "Companies can view their own stripe config" 
ON public.stripe_config 
FOR SELECT 
USING (can_access_company_data(company_id) OR company_id IS NULL);

CREATE POLICY "Companies can update their own stripe config" 
ON public.stripe_config 
FOR UPDATE 
USING (can_manage_company_data(company_id) OR (company_id IS NULL AND is_super_admin()));

CREATE POLICY "Companies can insert their own stripe config" 
ON public.stripe_config 
FOR INSERT 
WITH CHECK (can_manage_company_data(company_id) OR (company_id IS NULL AND is_super_admin()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stripe_config_updated_at
BEFORE UPDATE ON public.stripe_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();