-- MIGRAÇÃO DE UNIFICAÇÃO DO MÓDULO VENDAS
-- Consolidar pos_sales e sales em uma única estrutura otimizada

-- ETAPA 1: Adicionar novos campos à tabela sales para suportar vendas PDV
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'traditional' CHECK (sale_type IN ('traditional', 'pos')),
ADD COLUMN IF NOT EXISTS operator_id UUID,
ADD COLUMN IF NOT EXISTS nfce_number TEXT,
ADD COLUMN IF NOT EXISTS receipt_printed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ETAPA 2: Migrar dados de pos_sales para sales + sale_items
INSERT INTO public.sales (
  id,
  company_id,
  customer_id,
  sale_number,
  sale_date,
  status,
  subtotal,
  discount,
  total_amount,
  payment_method,
  notes,
  sale_type,
  operator_id,
  created_at,
  updated_at
)
SELECT 
  id,
  company_id,
  customer_id,
  sale_number,
  CURRENT_DATE, -- pos_sales não tem sale_date, usar data atual
  CASE 
    WHEN status = 'completed' THEN 'delivered'
    WHEN status = 'cancelled' THEN 'cancelled'
    ELSE 'pending'
  END as status,
  total_amount - COALESCE(discount, 0) as subtotal, -- calcular subtotal
  COALESCE(discount, 0),
  total_amount,
  -- Extrair primeiro método de pagamento do JSON
  CASE 
    WHEN jsonb_array_length(payments) > 0 THEN 
      (payments->0->>'method')::text
    ELSE 'money'
  END as payment_method,
  notes,
  'pos' as sale_type,
  operator_id,
  created_at,
  updated_at
FROM public.pos_sales
ON CONFLICT (id) DO NOTHING; -- Evitar duplicação se executado novamente

-- ETAPA 3: Migrar itens de pos_sales (JSON) para sale_items
INSERT INTO public.sale_items (
  sale_id,
  product_id,
  quantity,
  unit_price,
  discount,
  total_price
)
SELECT 
  pos.id as sale_id,
  (item->>'product_id')::uuid as product_id,
  (item->>'quantity')::integer as quantity,
  (item->>'unit_price')::numeric as unit_price,
  COALESCE((item->>'discount')::numeric, 0) as discount,
  (item->>'total_price')::numeric as total_price
FROM public.pos_sales pos,
jsonb_array_elements(pos.items) as item
WHERE jsonb_array_length(pos.items) > 0
ON CONFLICT DO NOTHING;

-- ETAPA 4: Criar função para gerar números de venda unificados
CREATE OR REPLACE FUNCTION generate_sale_number(company_uuid uuid, sale_type_param text DEFAULT 'traditional')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  next_number INTEGER;
  company_prefix TEXT;
  type_prefix TEXT;
BEGIN
  -- Definir prefixo baseado no tipo
  type_prefix := CASE 
    WHEN sale_type_param = 'pos' THEN 'PDV'
    ELSE 'VND'
  END;
  
  -- Buscar próximo número para a empresa e tipo
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.sales
  WHERE company_id = company_uuid 
    AND sale_type = sale_type_param;
  
  -- Usar prefixo da empresa ou padrão
  SELECT COALESCE(SUBSTRING(name FROM 1 FOR 3), type_prefix)
  INTO company_prefix
  FROM public.companies
  WHERE id = company_uuid;
  
  RETURN UPPER(company_prefix) || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$;

-- ETAPA 5: Remover campos desnecessários da tabela sales
ALTER TABLE public.sales 
DROP COLUMN IF EXISTS subtotal CASCADE,
DROP COLUMN IF EXISTS payment_terms CASCADE,
DROP COLUMN IF EXISTS created_by CASCADE;

-- ETAPA 6: Criar índices otimizados
CREATE INDEX IF NOT EXISTS idx_sales_sale_type ON public.sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_sales_operator_id ON public.sales(operator_id) WHERE operator_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_status_type ON public.sales(status, sale_type);
CREATE INDEX IF NOT EXISTS idx_sales_company_active ON public.sales(company_id, is_active);

-- ETAPA 7: Criar tabela para métodos de pagamento das vendas
CREATE TABLE IF NOT EXISTS public.sale_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('money', 'pix', 'card', 'boleto')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para sale_payments
CREATE INDEX IF NOT EXISTS idx_sale_payments_sale_id ON public.sale_payments(sale_id);

-- ETAPA 8: Migrar pagamentos de pos_sales para sale_payments
INSERT INTO public.sale_payments (
  sale_id,
  payment_method,
  amount,
  details
)
SELECT 
  pos.id as sale_id,
  (payment->>'method')::text as payment_method,
  (payment->>'amount')::numeric as amount,
  payment->>'details' as details
FROM public.pos_sales pos,
jsonb_array_elements(pos.payments) as payment
WHERE jsonb_array_length(pos.payments) > 0
ON CONFLICT DO NOTHING;

-- ETAPA 9: Adicionar RLS para sale_payments
ALTER TABLE public.sale_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company sale_payments access" ON public.sale_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_payments.sale_id 
    AND can_access_company_data(s.company_id)
  )
);

CREATE POLICY "Company sale_payments management" ON public.sale_payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_payments.sale_id 
    AND can_access_company_data(s.company_id)
    AND has_specific_permission('vendas', s.company_id)
  )
);

CREATE POLICY "Company sale_payments update" ON public.sale_payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_payments.sale_id 
    AND can_access_company_data(s.company_id)
    AND has_specific_permission('vendas', s.company_id)
  )
);

CREATE POLICY "Company sale_payments delete" ON public.sale_payments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.sales s 
    WHERE s.id = sale_payments.sale_id 
    AND can_manage_company_data(s.company_id)
  )
);

-- ETAPA 10: Atualizar trigger para sales
CREATE OR REPLACE FUNCTION update_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS update_sales_updated_at_trigger ON public.sales;
CREATE TRIGGER update_sales_updated_at_trigger
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_updated_at();