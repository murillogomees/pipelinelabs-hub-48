-- Create marketplace_integrations table to store marketplace authentication data
CREATE TABLE IF NOT EXISTS public.marketplace_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  marketplace TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'inactive'::text CHECK (status IN ('active', 'inactive', 'disconnected', 'error')),
  last_sync TIMESTAMP WITH TIME ZONE NULL,
  sync_status TEXT NULL,
  error_message TEXT NULL,
  webhook_url TEXT NULL,
  webhook_status TEXT NULL DEFAULT 'inactive'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace integrations
CREATE POLICY "Company marketplace integrations access" 
ON public.marketplace_integrations 
FOR SELECT 
USING (can_access_company_data(company_id));

CREATE POLICY "Company marketplace integrations management" 
ON public.marketplace_integrations 
FOR INSERT 
WITH CHECK (can_access_company_data(company_id));

CREATE POLICY "Company marketplace integrations update" 
ON public.marketplace_integrations 
FOR UPDATE 
USING (can_access_company_data(company_id));

CREATE POLICY "Company marketplace integrations delete" 
ON public.marketplace_integrations 
FOR DELETE 
USING (can_manage_company_data(company_id));

-- Create trigger for updated_at
CREATE TRIGGER update_marketplace_integrations_updated_at
  BEFORE UPDATE ON public.marketplace_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_channels_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_marketplace_integrations_company_id ON public.marketplace_integrations(company_id);
CREATE INDEX idx_marketplace_integrations_marketplace ON public.marketplace_integrations(marketplace);
CREATE INDEX idx_marketplace_integrations_status ON public.marketplace_integrations(status);