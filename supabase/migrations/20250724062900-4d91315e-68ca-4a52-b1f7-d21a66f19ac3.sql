-- Criar tabela marketplace_channels com campos completos
CREATE TABLE public.marketplace_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.marketplace_channels ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Admin users can manage marketplace channels"
ON public.marketplace_channels
FOR ALL
TO authenticated
USING (is_super_admin() OR is_contratante());

CREATE POLICY "Authenticated users can view active marketplace channels"
ON public.marketplace_channels
FOR SELECT
TO authenticated
USING (status = true OR is_super_admin() OR is_contratante());

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_marketplace_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketplace_channels_updated_at
  BEFORE UPDATE ON public.marketplace_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_channels_updated_at();

-- Inserir alguns canais de exemplo
INSERT INTO public.marketplace_channels (name, slug, description, logo_url) VALUES
('Mercado Livre', 'mercado-livre', 'Maior marketplace da América Latina', '/marketplace-logos/mercado-livre.png'),
('Amazon', 'amazon', 'Marketplace global da Amazon', '/marketplace-logos/amazon.png'),
('Magazine Luiza', 'magazine-luiza', 'Marketplace do Magazine Luiza', '/marketplace-logos/magalu.png'),
('Shopee', 'shopee', 'Marketplace asiático em crescimento', '/marketplace-logos/shopee.png');