-- Criar tabela de marketplaces disponíveis no sistema
CREATE TABLE IF NOT EXISTS public.marketplace_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
  config_schema JSONB NOT NULL DEFAULT '{}',
  webhook_endpoints JSONB DEFAULT '{}',
  oauth_config JSONB DEFAULT '{}',
  required_plan_features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_channels ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para marketplace_channels
CREATE POLICY "Everyone can view active channels" 
ON public.marketplace_channels 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Super admins can manage all channels" 
ON public.marketplace_channels 
FOR ALL 
USING (is_super_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_marketplace_channels_updated_at
  BEFORE UPDATE ON public.marketplace_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de configurações por empresa para cada marketplace
CREATE TABLE IF NOT EXISTS public.company_marketplace_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  global_config JSONB DEFAULT '{}',
  webhook_config JSONB DEFAULT '{}',
  api_limits JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, channel_name)
);

-- Enable RLS
ALTER TABLE public.company_marketplace_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para company_marketplace_configs
CREATE POLICY "Companies can view their configs" 
ON public.company_marketplace_configs 
FOR SELECT 
USING (can_access_company_data(company_id));

CREATE POLICY "Super admins can manage all configs" 
ON public.company_marketplace_configs 
FOR ALL 
USING (is_super_admin());

CREATE POLICY "Company admins can create configs" 
ON public.company_marketplace_configs 
FOR INSERT 
WITH CHECK (can_manage_company_data(company_id));

CREATE POLICY "Company admins can update configs" 
ON public.company_marketplace_configs 
FOR UPDATE 
USING (can_manage_company_data(company_id));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_company_marketplace_configs_updated_at
  BEFORE UPDATE ON public.company_marketplace_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir marketplaces padrão
INSERT INTO public.marketplace_channels (name, display_name, description, logo_url, status, config_schema, oauth_config, required_plan_features) VALUES
('mercadolivre', 'Mercado Livre', 'Marketplace líder na América Latina', '/marketplace-logos/mercadolivre.png', 'active', 
 '{"fields": [{"name": "client_id", "label": "Client ID", "type": "text", "required": true}, {"name": "client_secret", "label": "Client Secret", "type": "password", "required": true}, {"name": "environment", "label": "Ambiente", "type": "select", "options": ["sandbox", "production"], "default": "sandbox"}]}',
 '{"auth_url": "https://auth.mercadolibre.com.ar/authorization", "token_url": "https://api.mercadolibre.com/oauth/token", "scopes": ["read", "write"]}',
 '["marketplace_integrations"]'),

('shopee', 'Shopee', 'Marketplace asiático em crescimento no Brasil', '/marketplace-logos/shopee.png', 'active',
 '{"fields": [{"name": "partner_id", "label": "Partner ID", "type": "text", "required": true}, {"name": "partner_key", "label": "Partner Key", "type": "password", "required": true}, {"name": "shop_id", "label": "Shop ID", "type": "text", "required": true}]}',
 '{}',
 '["marketplace_integrations"]'),

('amazon', 'Amazon', 'Marketplace global da Amazon', '/marketplace-logos/amazon.png', 'active',
 '{"fields": [{"name": "marketplace_id", "label": "Marketplace ID", "type": "text", "required": true}, {"name": "seller_id", "label": "Seller ID", "type": "text", "required": true}, {"name": "access_key", "label": "Access Key", "type": "text", "required": true}, {"name": "secret_key", "label": "Secret Key", "type": "password", "required": true}]}',
 '{}',
 '["marketplace_integrations", "premium_features"]'),

('magalu', 'Magazine Luiza', 'Marketplace do Magazine Luiza', '/marketplace-logos/magalu.png', 'active',
 '{"fields": [{"name": "client_id", "label": "Client ID", "type": "text", "required": true}, {"name": "client_secret", "label": "Client Secret", "type": "password", "required": true}, {"name": "tenant_id", "label": "Tenant ID", "type": "text", "required": true}]}',
 '{"auth_url": "https://oauth.magazineluiza.com/oauth/authorize", "token_url": "https://oauth.magazineluiza.com/oauth/token"}',
 '["marketplace_integrations"]'),

('casasbahia', 'Casas Bahia', 'Marketplace das Casas Bahia (Via Varejo)', '/marketplace-logos/casasbahia.png', 'maintenance',
 '{"fields": [{"name": "api_key", "label": "API Key", "type": "password", "required": true}, {"name": "seller_code", "label": "Código do Vendedor", "type": "text", "required": true}]}',
 '{}',
 '["marketplace_integrations", "premium_features"]);

-- Atualizar a tabela marketplace_integrations para referenciar os canais
ALTER TABLE public.marketplace_integrations 
ADD COLUMN IF NOT EXISTS channel_name TEXT REFERENCES public.marketplace_channels(name);

-- Migrar dados existentes se houver
UPDATE public.marketplace_integrations 
SET channel_name = marketplace 
WHERE channel_name IS NULL AND marketplace IS NOT NULL;