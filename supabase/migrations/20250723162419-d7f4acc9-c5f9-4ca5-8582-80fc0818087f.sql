-- Continuar com as validações e constraints

-- 1. Garantir unicidade do documento (CPF/CNPJ)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_document_unique 
ON public.profiles (document) 
WHERE document IS NOT NULL;

-- 2. Adicionar constraint para validar documento não vazio
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS check_document_not_empty 
CHECK (document IS NULL OR LENGTH(TRIM(document)) > 0);

-- 3. Criar função para validar CPF/CNPJ
CREATE OR REPLACE FUNCTION public.validate_document(doc TEXT, doc_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Remove caracteres especiais
  doc := REGEXP_REPLACE(doc, '[^0-9]', '', 'g');
  
  -- Validar CPF (11 dígitos)
  IF doc_type = 'cpf' THEN
    RETURN LENGTH(doc) = 11 AND doc ~ '^[0-9]{11}$';
  END IF;
  
  -- Validar CNPJ (14 dígitos)
  IF doc_type = 'cnpj' THEN
    RETURN LENGTH(doc) = 14 AND doc ~ '^[0-9]{14}$';
  END IF;
  
  RETURN FALSE;
END;
$$;

-- 4. Adicionar constraint de validação de documento
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS check_valid_document 
CHECK (
  document IS NULL OR 
  (document_type IS NOT NULL AND validate_document(document, document_type))
);

-- 5. Criar índice para melhor performance em consultas por documento
CREATE INDEX IF NOT EXISTS idx_profiles_document_search 
ON public.profiles (document, document_type) 
WHERE document IS NOT NULL;