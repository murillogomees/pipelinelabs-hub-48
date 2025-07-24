-- Create marketplace_integrations table
CREATE TABLE IF NOT EXISTS public.marketplace_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'disconnected', 'error')),
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, marketplace)
);

-- Enable RLS
ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace_integrations
CREATE POLICY "Users can view integrations from their company" 
ON public.marketplace_integrations 
FOR SELECT 
USING (can_access_company_data(company_id));

CREATE POLICY "Users can create integrations for their company" 
ON public.marketplace_integrations 
FOR INSERT 
WITH CHECK (can_access_company_data(company_id));

CREATE POLICY "Users can update integrations from their company" 
ON public.marketplace_integrations 
FOR UPDATE 
USING (can_access_company_data(company_id));

CREATE POLICY "Users can delete integrations from their company" 
ON public.marketplace_integrations 
FOR DELETE 
USING (can_access_company_data(company_id));

-- Create trigger for updated_at
CREATE TRIGGER update_marketplace_integrations_updated_at
BEFORE UPDATE ON public.marketplace_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();