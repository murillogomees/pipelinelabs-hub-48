-- Criar tabelas para sistema de integrações

-- Tabela de integrações disponíveis (gerenciada pelo admin)
CREATE TABLE IF NOT EXISTS public.integrations_available (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('marketplace', 'logistica', 'financeiro', 'api', 'comunicacao', 'contabilidade', 'personalizada')),
  description TEXT,
  logo_url TEXT,
  config_schema JSONB DEFAULT '[]'::jsonb,
  available_for_plans TEXT[] DEFAULT '{}',
  visible_to_companies BOOLEAN DEFAULT false,
  is_global_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de integrações das empresas (configurado pela empresa)
CREATE TABLE IF NOT EXISTS public.company_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.integrations_available(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  credentials JSONB, -- armazenado criptografado
  config JSONB DEFAULT '{}'::jsonb,
  last_tested TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, integration_id)
);

-- Enable Row Level Security
ALTER TABLE public.integrations_available ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies para integrations_available
CREATE POLICY "Admins can manage all integrations_available" 
ON public.integrations_available
FOR ALL
USING (is_current_user_admin());

CREATE POLICY "Companies can view available integrations" 
ON public.integrations_available
FOR SELECT
USING (visible_to_companies = true);

-- RLS Policies para company_integrations
CREATE POLICY "Admins can manage all company_integrations" 
ON public.company_integrations
FOR ALL
USING (is_current_user_admin());

CREATE POLICY "Company scoped select company_integrations" 
ON public.company_integrations
FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped insert company_integrations" 
ON public.company_integrations
FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company scoped update company_integrations" 
ON public.company_integrations
FOR UPDATE
USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped delete company_integrations" 
ON public.company_integrations
FOR DELETE
USING (company_id = get_user_company_id());

-- Trigger para updated_at
CREATE TRIGGER update_integrations_available_updated_at
  BEFORE UPDATE ON public.integrations_available
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_integrations_updated_at
  BEFORE UPDATE ON public.company_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();