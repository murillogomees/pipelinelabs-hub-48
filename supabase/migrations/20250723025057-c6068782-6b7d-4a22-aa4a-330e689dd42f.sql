-- Add missing columns to user_companies table
ALTER TABLE public.user_companies 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'operador',
ADD COLUMN IF NOT EXISTS specific_permissions JSONB DEFAULT '{}';

-- Create integrations_available table
CREATE TABLE IF NOT EXISTS public.integrations_available (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  config_schema JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create company_integrations table
CREATE TABLE IF NOT EXISTS public.company_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations_available(id),
  status TEXT DEFAULT 'inactive',
  config JSONB DEFAULT '{}',
  credentials JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.integrations_available ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_integrations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for integrations_available
CREATE POLICY "Everyone can view active integrations" 
ON public.integrations_available 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Super admins can manage integrations" 
ON public.integrations_available 
FOR ALL 
USING (is_super_admin());

-- Add RLS policies for company_integrations
CREATE POLICY "Company integrations access" 
ON public.company_integrations 
FOR SELECT 
USING (can_access_company_data(company_id));

CREATE POLICY "Company integrations management" 
ON public.company_integrations 
FOR ALL 
USING (can_manage_company_data(company_id));

-- Insert some default integrations
INSERT INTO public.integrations_available (name, description, type, config_schema) VALUES
('NFe.io', 'Integração para emissão de NFe', 'fiscal', '[{"name": "api_token", "type": "password", "label": "Token da API", "required": true}]'),
('Stripe', 'Gateway de pagamento Stripe', 'payment', '[{"name": "public_key", "type": "text", "label": "Chave Pública"}, {"name": "secret_key", "type": "password", "label": "Chave Secreta"}]'),
('Mercado Livre', 'Integração com Mercado Livre', 'marketplace', '[{"name": "client_id", "type": "text", "label": "Client ID"}, {"name": "client_secret", "type": "password", "label": "Client Secret"}]')
ON CONFLICT DO NOTHING;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_integrations_available_updated_at 
    BEFORE UPDATE ON public.integrations_available 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_integrations_updated_at 
    BEFORE UPDATE ON public.company_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();