-- LIMPEZA E OTIMIZAÇÃO DA TABELA PRODUCTS
-- Remover campos não utilizados e adicionar apenas os essenciais que estão sendo usados nos formulários

-- Primeiro, vamos verificar quais colunas realmente precisamos manter
-- Campos OBRIGATÓRIOS que devem permanecer:
-- id, company_id, code, name, price, stock_quantity, created_at, updated_at, is_active

-- Campos OPCIONAIS que são utilizados:
-- description, cost_price, weight, dimensions, barcode, ncm_code, tax_origin, tax_situation
-- min_stock, max_stock, stock_location, category_id

-- PROBLEMAS IDENTIFICADOS:
-- 1. Muitos campos usados nos formulários NÃO EXISTEM na tabela
-- 2. Formulários estão tentando usar campos que não foram criados
-- 3. Estrutura inconsistente entre frontend e backend

-- Vamos adicionar os campos essenciais que estão sendo usados nos formulários
-- mas que não existem na tabela atual

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'produto',
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'un',
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'novo',
ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'simples',
ADD COLUMN IF NOT EXISTS production_type TEXT DEFAULT 'propria',
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gross_weight NUMERIC,
ADD COLUMN IF NOT EXISTS volumes INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS height NUMERIC,
ADD COLUMN IF NOT EXISTS width NUMERIC,
ADD COLUMN IF NOT EXISTS depth NUMERIC,
ADD COLUMN IF NOT EXISTS unit_measure TEXT DEFAULT 'cm',
ADD COLUMN IF NOT EXISTS external_link TEXT,
ADD COLUMN IF NOT EXISTS video_link TEXT,
ADD COLUMN IF NOT EXISTS observations TEXT,
ADD COLUMN IF NOT EXISTS promotional_price NUMERIC,
ADD COLUMN IF NOT EXISTS stock_notes TEXT,
ADD COLUMN IF NOT EXISTS crossdocking_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS warehouse TEXT,
ADD COLUMN IF NOT EXISTS cest_code TEXT,
ADD COLUMN IF NOT EXISTS item_type TEXT,
ADD COLUMN IF NOT EXISTS product_group TEXT,
ADD COLUMN IF NOT EXISTS icms_base NUMERIC,
ADD COLUMN IF NOT EXISTS icms_retention NUMERIC,
ADD COLUMN IF NOT EXISTS pis_fixed NUMERIC,
ADD COLUMN IF NOT EXISTS cofins_fixed NUMERIC,
ADD COLUMN IF NOT EXISTS estimated_tax_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS tipi_exception TEXT;

-- Adicionar índices para performance nos campos mais consultados
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at_trigger
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();