-- Verifica se a tabela purchase_orders existe e cria se necessário
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  order_number text NOT NULL,
  supplier_id uuid,
  supplier_name text,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  delivery_date date,
  status text NOT NULL DEFAULT 'draft'::text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  shipping_cost numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  notes text,
  internal_notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company purchase_orders access" 
ON public.purchase_orders 
FOR SELECT 
USING (can_access_company_data(company_id));

CREATE POLICY "Company purchase_orders insert" 
ON public.purchase_orders 
FOR INSERT 
WITH CHECK (can_access_company_data(company_id) AND has_specific_permission('compras'::text, company_id));

CREATE POLICY "Company purchase_orders update" 
ON public.purchase_orders 
FOR UPDATE 
USING (can_access_company_data(company_id) AND has_specific_permission('compras'::text, company_id));

CREATE POLICY "Company purchase_orders delete" 
ON public.purchase_orders 
FOR DELETE 
USING (can_manage_company_data(company_id));

-- Create updated_at trigger
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update the generate_purchase_order_number function to actually work
CREATE OR REPLACE FUNCTION public.generate_purchase_order_number(company_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_number INTEGER;
  company_prefix TEXT;
  current_year TEXT;
BEGIN
  -- Ano atual
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Buscar próximo número para a empresa no ano atual
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.purchase_orders
  WHERE company_id = company_uuid 
    AND order_number LIKE '%' || current_year || '%';
  
  -- Usar prefixo da empresa ou PC como padrão
  SELECT COALESCE(SUBSTRING(name FROM 1 FOR 3), 'PC')
  INTO company_prefix
  FROM public.companies
  WHERE id = company_uuid;
  
  RETURN UPPER(company_prefix) || '-' || LPAD(next_number::TEXT, 4, '0') || '/' || current_year;
END;
$function$;