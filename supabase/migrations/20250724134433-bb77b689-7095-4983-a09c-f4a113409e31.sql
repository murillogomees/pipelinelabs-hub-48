-- Fix database function security by setting explicit search paths

-- Update get_default_company_id function with secure search path
CREATE OR REPLACE FUNCTION public.get_default_company_id()
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    -- Return the first company ID or 1 as fallback
    RETURN COALESCE((SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1), 1);
END;
$function$;

-- Update generate_purchase_order_number function with secure search path
CREATE OR REPLACE FUNCTION public.generate_purchase_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    -- Generate purchase order number with sequence
    RETURN 'PO-' || LPAD(nextval('purchase_order_seq')::text, 6, '0');
END;
$function$;

-- Update generate_pos_sale_number function with secure search path
CREATE OR REPLACE FUNCTION public.generate_pos_sale_number(company_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  next_number INTEGER;
  company_prefix TEXT;
BEGIN
  -- Find next number for the company
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.pos_sales
  WHERE company_id = company_uuid;
  
  -- Use company prefix or default to 'PDV'
  SELECT COALESCE(SUBSTRING(name FROM 1 FOR 3), 'PDV')
  INTO company_prefix
  FROM public.companies
  WHERE id = company_uuid;
  
  RETURN UPPER(company_prefix) || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$function$;

-- Update validate_document function with secure search path
CREATE OR REPLACE FUNCTION public.validate_document(doc text, doc_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Remove special characters
  doc := REGEXP_REPLACE(doc, '[^0-9]', '', 'g');
  
  -- Validate CPF (11 digits)
  IF doc_type = 'cpf' THEN
    RETURN LENGTH(doc) = 11 AND doc ~ '^[0-9]{11}$';
  END IF;
  
  -- Validate CNPJ (14 digits)
  IF doc_type = 'cnpj' THEN
    RETURN LENGTH(doc) = 14 AND doc ~ '^[0-9]{14}$';
  END IF;
  
  RETURN FALSE;
END;
$function$;

-- Update generate_nfe_access_key function with secure search path
CREATE OR REPLACE FUNCTION public.generate_nfe_access_key(company_cnpj text, serie_nfe text, numero_nfe text, emission_date date DEFAULT CURRENT_DATE)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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
  -- Clean CNPJ
  cnpj_clean := REGEXP_REPLACE(company_cnpj, '[^0-9]', '', 'g');
  
  -- Format AAMM
  year_month := TO_CHAR(emission_date, 'YYMM');
  
  -- Build access key without verification digit
  access_key := uf_code || year_month || cnpj_clean || model || 
                LPAD(serie_nfe, 3, '0') || LPAD(numero_nfe, 9, '0') || 
                emission_type || sequence_code;
  
  -- Calculate verification digit (simplified)
  verification_digit := (LENGTH(access_key) % 10)::TEXT;
  
  RETURN access_key || verification_digit;
END;
$function$;