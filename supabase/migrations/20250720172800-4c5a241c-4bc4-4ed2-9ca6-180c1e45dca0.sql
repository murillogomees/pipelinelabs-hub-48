
-- Criar tabela para armazenar XMLs das NFe
CREATE TABLE IF NOT EXISTS public.nfe_xmls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  xml_content TEXT NOT NULL,
  xml_signature TEXT,
  protocol_number TEXT,
  access_key TEXT UNIQUE,
  qr_code TEXT,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nfe_xmls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company scoped select nfe_xmls" ON public.nfe_xmls
FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped insert nfe_xmls" ON public.nfe_xmls
FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company scoped update nfe_xmls" ON public.nfe_xmls
FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped delete nfe_xmls" ON public.nfe_xmls
FOR DELETE USING (company_id = get_user_company_id());

CREATE POLICY "Super admin can view all nfe_xmls" ON public.nfe_xmls
FOR SELECT USING (is_super_admin());

-- Criar tabela para itens da NFe
CREATE TABLE IF NOT EXISTS public.nfe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  item_code TEXT NOT NULL,
  item_description TEXT NOT NULL,
  ncm_code TEXT,
  quantity DECIMAL(10,3) NOT NULL,
  unit_value DECIMAL(15,2) NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  icms_base DECIMAL(15,2) DEFAULT 0,
  icms_value DECIMAL(15,2) DEFAULT 0,
  icms_percentage DECIMAL(5,2) DEFAULT 0,
  pis_base DECIMAL(15,2) DEFAULT 0,
  pis_value DECIMAL(15,2) DEFAULT 0,
  pis_percentage DECIMAL(5,2) DEFAULT 0,
  cofins_base DECIMAL(15,2) DEFAULT 0,
  cofins_value DECIMAL(15,2) DEFAULT 0,
  cofins_percentage DECIMAL(5,2) DEFAULT 0,
  ipi_base DECIMAL(15,2) DEFAULT 0,
  ipi_value DECIMAL(15,2) DEFAULT 0,
  ipi_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nfe_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for nfe_items
CREATE POLICY "Company scoped select nfe_items" ON public.nfe_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = nfe_items.invoice_id 
    AND invoices.company_id = get_user_company_id()
  )
);

CREATE POLICY "Company scoped insert nfe_items" ON public.nfe_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = nfe_items.invoice_id 
    AND invoices.company_id = get_user_company_id()
  )
);

CREATE POLICY "Company scoped update nfe_items" ON public.nfe_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = nfe_items.invoice_id 
    AND invoices.company_id = get_user_company_id()
  )
);

CREATE POLICY "Company scoped delete nfe_items" ON public.nfe_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = nfe_items.invoice_id 
    AND invoices.company_id = get_user_company_id()
  )
);

-- Função para gerar número de NFe
CREATE OR REPLACE FUNCTION public.generate_nfe_number(company_uuid uuid, serie_nfe text DEFAULT '001')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  next_number INTEGER;
BEGIN
  -- Buscar próximo número para a empresa e série
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE company_id = company_uuid 
    AND invoice_type = 'NFE'
    AND series = serie_nfe;
  
  RETURN LPAD(next_number::TEXT, 9, '0');
END;
$function$;

-- Função para gerar chave de acesso da NFe
CREATE OR REPLACE FUNCTION public.generate_nfe_access_key(
  company_cnpj text,
  serie_nfe text,
  numero_nfe text,
  emission_date date DEFAULT CURRENT_DATE
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  uf_code TEXT := '35'; -- SP por padrão, ajustar conforme necessário
  year_month TEXT;
  cnpj_clean TEXT;
  model TEXT := '55'; -- NFe
  sequence_code TEXT := '001';
  emission_type TEXT := '1'; -- Normal
  verification_digit TEXT;
  access_key TEXT;
BEGIN
  -- Limpar CNPJ
  cnpj_clean := REGEXP_REPLACE(company_cnpj, '[^0-9]', '', 'g');
  
  -- Formato AAMM
  year_month := TO_CHAR(emission_date, 'YYMM');
  
  -- Montar chave sem DV
  access_key := uf_code || year_month || cnpj_clean || model || 
                LPAD(serie_nfe, 3, '0') || LPAD(numero_nfe, 9, '0') || 
                emission_type || sequence_code;
  
  -- Calcular dígito verificador (simplificado)
  verification_digit := (LENGTH(access_key) % 10)::TEXT;
  
  RETURN access_key || verification_digit;
END;
$function$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_nfe_xmls_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trigger_update_nfe_xmls_updated_at
  BEFORE UPDATE ON public.nfe_xmls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_nfe_xmls_updated_at();
