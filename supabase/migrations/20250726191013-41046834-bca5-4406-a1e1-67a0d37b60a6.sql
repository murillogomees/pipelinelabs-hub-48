
-- Create access_levels table
CREATE TABLE IF NOT EXISTS public.access_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add access_level_id column to user_companies if it doesn't exist
ALTER TABLE public.user_companies 
ADD COLUMN IF NOT EXISTS access_level_id UUID REFERENCES public.access_levels(id);

-- Enable RLS on access_levels
ALTER TABLE public.access_levels ENABLE ROW LEVEL SECURITY;

-- Create policies for access_levels
CREATE POLICY "Everyone can view active access levels" ON public.access_levels
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage access levels" ON public.access_levels
  FOR ALL USING (is_super_admin());

-- Insert default access levels
INSERT INTO public.access_levels (name, display_name, description, permissions, is_system) VALUES
('super_admin', 'Super Administrador', 'Acesso total ao sistema', '{"dashboard": true, "vendas": true, "produtos": true, "clientes": true, "compras": true, "estoque": true, "financeiro": true, "notas_fiscais": true, "producao": true, "contratos": true, "relatorios": true, "analytics": true, "marketplace_canais": true, "integracoes": true, "configuracoes": true}', true),
('contratante', 'Contratante', 'Acesso de administrador da empresa', '{"dashboard": true, "vendas": true, "produtos": true, "clientes": true, "compras": true, "estoque": true, "financeiro": true, "notas_fiscais": true, "producao": true, "contratos": true, "relatorios": true, "analytics": true, "marketplace_canais": true, "integracoes": true, "configuracoes": true}', true),
('operador', 'Operador', 'Acesso básico operacional', '{"dashboard": true, "vendas": true, "produtos": true, "clientes": true, "compras": true, "estoque": true, "financeiro": false, "notas_fiscais": false, "producao": true, "contratos": false, "relatorios": true, "analytics": false, "marketplace_canais": false, "integracoes": false, "configuracoes": false}', true)
ON CONFLICT (name) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_access_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_access_levels_updated_at_trigger
  BEFORE UPDATE ON public.access_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_access_levels_updated_at();
