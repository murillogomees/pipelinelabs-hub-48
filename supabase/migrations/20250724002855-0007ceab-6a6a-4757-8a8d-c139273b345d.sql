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