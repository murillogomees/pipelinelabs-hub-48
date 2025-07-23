-- Otimização do Cadastro de Usuários - Validações e Campos Obrigatórios

-- 1. Adicionar campos obrigatórios à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS document TEXT,
ADD COLUMN IF NOT EXISTS document_type TEXT CHECK (document_type IN ('cpf', 'cnpj')),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS zipcode TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS person_type TEXT CHECK (person_type IN ('individual', 'company')) DEFAULT 'individual';

-- 2. Tornar campos obrigatórios NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN display_name SET NOT NULL,
ALTER COLUMN email SET NOT NULL;

-- 3. Garantir unicidade do documento (CPF/CNPJ)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_document_unique 
ON public.profiles (document) 
WHERE document IS NOT NULL;

-- 4. Adicionar constraint para validar documento não vazio
ALTER TABLE public.profiles 
ADD CONSTRAINT check_document_not_empty 
CHECK (document IS NULL OR LENGTH(TRIM(document)) > 0);

-- 5. Criar função para validar CPF/CNPJ
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

-- 6. Adicionar constraint de validação de documento
ALTER TABLE public.profiles 
ADD CONSTRAINT check_valid_document 
CHECK (
  document IS NULL OR 
  (document_type IS NOT NULL AND validate_document(document, document_type))
);

-- 7. Criar índice para melhor performance em consultas por documento
CREATE INDEX IF NOT EXISTS idx_profiles_document_search 
ON public.profiles (document, document_type) 
WHERE document IS NOT NULL;

-- 8. Atualizar trigger para garantir limpeza do documento
CREATE OR REPLACE FUNCTION public.clean_document_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Limpar documento removendo caracteres especiais
  IF NEW.document IS NOT NULL THEN
    NEW.document := REGEXP_REPLACE(NEW.document, '[^0-9]', '', 'g');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para limpeza automática do documento
DROP TRIGGER IF EXISTS clean_document_before_insert ON public.profiles;
CREATE TRIGGER clean_document_before_insert
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.clean_document_trigger();

-- 9. Atualizar política RLS para incluir validação de documento único
CREATE OR REPLACE FUNCTION public.check_document_uniqueness(doc TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Permitir se documento for NULL
  IF doc IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se documento já existe
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE document = doc
  );
END;
$$;

-- 10. Criar função para log de tentativas de duplicação
CREATE OR REPLACE FUNCTION public.log_duplicate_document_attempt(
  p_user_id UUID,
  p_document TEXT,
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    company_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    severity,
    status,
    details
  ) VALUES (
    (SELECT get_default_company_id()),
    p_user_id,
    'user:duplicate_document_attempt',
    'user_registration',
    p_user_id::text,
    null,
    jsonb_build_object(
      'attempted_document', p_document,
      'attempted_email', p_email
    ),
    p_ip_address,
    'warning',
    'blocked',
    jsonb_build_object(
      'reason', 'Document already exists in system',
      'support_contact', 'https://wa.me/5511999999999'
    )
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;