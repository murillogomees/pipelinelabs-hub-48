-- Criar tabela para vendas do PDV
CREATE TABLE public.pos_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  customer_id UUID,
  sale_number TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  payments JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed',
  receipt_printed BOOLEAN DEFAULT false,
  nfce_issued BOOLEAN DEFAULT false,
  nfce_key TEXT,
  notes TEXT,
  operator_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para propostas comerciais
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  customer_id UUID,
  proposal_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  description TEXT,
  expiration_date DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  services JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_terms TEXT,
  delivery_terms TEXT,
  notes TEXT,
  internal_notes TEXT,
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  converted_to_sale_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_pos_sales_company_id ON public.pos_sales(company_id);
CREATE INDEX idx_pos_sales_created_at ON public.pos_sales(created_at DESC);
CREATE INDEX idx_pos_sales_customer_id ON public.pos_sales(customer_id);

CREATE INDEX idx_proposals_company_id ON public.proposals(company_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_customer_id ON public.proposals(customer_id);
CREATE INDEX idx_proposals_expiration_date ON public.proposals(expiration_date);

-- Habilitar RLS nas tabelas
ALTER TABLE public.pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pos_sales
CREATE POLICY "Company scoped select pos_sales" 
ON public.pos_sales 
FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped insert pos_sales" 
ON public.pos_sales 
FOR INSERT 
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company scoped update pos_sales" 
ON public.pos_sales 
FOR UPDATE 
USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped delete pos_sales" 
ON public.pos_sales 
FOR DELETE 
USING (company_id = get_user_company_id());

-- Políticas RLS para proposals
CREATE POLICY "Company scoped select proposals" 
ON public.proposals 
FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped insert proposals" 
ON public.proposals 
FOR INSERT 
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company scoped update proposals" 
ON public.proposals 
FOR UPDATE 
USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped delete proposals" 
ON public.proposals 
FOR DELETE 
USING (company_id = get_user_company_id());

-- Triggers para updated_at
CREATE TRIGGER update_pos_sales_updated_at
BEFORE UPDATE ON public.pos_sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar número sequencial de vendas PDV
CREATE OR REPLACE FUNCTION public.generate_pos_sale_number(company_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  company_prefix TEXT;
BEGIN
  -- Buscar próximo número para a empresa
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.pos_sales
  WHERE company_id = company_uuid;
  
  -- Usar prefixo da empresa ou PDV como padrão
  SELECT COALESCE(SUBSTRING(name FROM 1 FOR 3), 'PDV')
  INTO company_prefix
  FROM public.companies
  WHERE id = company_uuid;
  
  RETURN UPPER(company_prefix) || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar número sequencial de propostas
CREATE OR REPLACE FUNCTION public.generate_proposal_number(company_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  company_prefix TEXT;
  current_year TEXT;
BEGIN
  -- Ano atual
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Buscar próximo número para a empresa no ano atual
  SELECT COALESCE(MAX(CAST(SUBSTRING(proposal_number FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.proposals
  WHERE company_id = company_uuid 
    AND proposal_number LIKE '%' || current_year || '%';
  
  -- Usar prefixo da empresa ou PROP como padrão
  SELECT COALESCE(SUBSTRING(name FROM 1 FOR 3), 'PROP')
  INTO company_prefix
  FROM public.companies
  WHERE id = company_uuid;
  
  RETURN UPPER(company_prefix) || '-' || LPAD(next_number::TEXT, 4, '0') || '/' || current_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;