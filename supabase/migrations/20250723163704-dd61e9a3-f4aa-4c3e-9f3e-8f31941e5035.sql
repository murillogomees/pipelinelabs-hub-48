-- Corrigir função validate_cnpj com search_path seguro
CREATE OR REPLACE FUNCTION public.validate_cnpj(cnpj_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cnpj_clean text;
BEGIN
  -- Remove caracteres especiais
  cnpj_clean := REGEXP_REPLACE(cnpj_input, '[^0-9]', '', 'g');
  
  -- Validar se tem 14 dígitos
  IF LENGTH(cnpj_clean) != 14 THEN
    RETURN false;
  END IF;
  
  -- Validar se não é sequência de números iguais
  IF cnpj_clean IN ('00000000000000', '11111111111111', '22222222222222', 
                    '33333333333333', '44444444444444', '55555555555555',
                    '66666666666666', '77777777777777', '88888888888888', 
                    '99999999999999') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;