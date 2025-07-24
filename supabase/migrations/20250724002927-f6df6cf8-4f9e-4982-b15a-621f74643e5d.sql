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