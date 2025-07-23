-- Adicionar campos necessários para empresa contratante na tabela companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS legal_name text,
ADD COLUMN IF NOT EXISTS trade_name text,
ADD COLUMN IF NOT EXISTS state_registration text,
ADD COLUMN IF NOT EXISTS municipal_registration text,
ADD COLUMN IF NOT EXISTS tax_regime text DEFAULT 'simples_nacional',
ADD COLUMN IF NOT EXISTS legal_representative text,
ADD COLUMN IF NOT EXISTS fiscal_email text;

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.companies.legal_name IS 'Razão Social da empresa';
COMMENT ON COLUMN public.companies.trade_name IS 'Nome Fantasia da empresa';
COMMENT ON COLUMN public.companies.state_registration IS 'Inscrição Estadual';
COMMENT ON COLUMN public.companies.municipal_registration IS 'Inscrição Municipal';
COMMENT ON COLUMN public.companies.tax_regime IS 'Regime Tributário (simples_nacional, lucro_real, lucro_presumido)';
COMMENT ON COLUMN public.companies.legal_representative IS 'Responsável Legal da empresa';
COMMENT ON COLUMN public.companies.fiscal_email IS 'E-mail fiscal da empresa';

-- Garantir que o CNPJ seja único (document já existe)
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_document_unique 
ON public.companies (document) 
WHERE document IS NOT NULL;

-- Criar função para validar CNPJ
CREATE OR REPLACE FUNCTION public.validate_cnpj(cnpj_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Adicionar constraint para validar CNPJ
ALTER TABLE public.companies 
ADD CONSTRAINT check_valid_cnpj 
CHECK (document IS NULL OR validate_cnpj(document));

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_companies_legal_name 
ON public.companies (legal_name) 
WHERE legal_name IS NOT NULL;