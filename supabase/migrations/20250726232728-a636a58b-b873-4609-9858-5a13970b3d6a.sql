
-- Adicionar a coluna updated_at na tabela user_companies
ALTER TABLE public.user_companies 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Criar trigger para atualizar automaticamente o updated_at
CREATE OR REPLACE FUNCTION update_user_companies_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar o trigger na tabela user_companies
DROP TRIGGER IF EXISTS update_user_companies_updated_at_trigger ON public.user_companies;
CREATE TRIGGER update_user_companies_updated_at_trigger
  BEFORE UPDATE ON public.user_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_user_companies_updated_at();
