-- Criar tabela integrations_available se não existir
CREATE TABLE IF NOT EXISTS public.integrations_available (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fiscal', 'payment', 'shipping', 'marketplace', 'communication', 'other')),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  config_schema JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, type)
);

-- Enable RLS
ALTER TABLE public.integrations_available ENABLE ROW LEVEL SECURITY;

-- Política para super admins lerem e modificarem
CREATE POLICY "Super admins can manage integrations" ON public.integrations_available
  FOR ALL USING (is_super_admin());

-- Política para usuários autenticados visualizarem integrações ativas
CREATE POLICY "Authenticated users can view active integrations" ON public.integrations_available
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_integrations_available_updated_at
  BEFORE UPDATE ON public.integrations_available
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir integração NFE.io padrão
INSERT INTO public.integrations_available (name, type, description, is_active, config_schema)
VALUES (
  'NFE.io',
  'fiscal',
  'Integração para emissão de Notas Fiscais Eletrônicas via NFE.io',
  false,
  '{
    "api_token": "",
    "environment": "sandbox",
    "webhook_url": "",
    "timeout": 30
  }'::jsonb
) ON CONFLICT (name, type) DO NOTHING;