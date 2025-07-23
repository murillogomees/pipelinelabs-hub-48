-- Corrigir problema de segurança da função que acabou de ser criada
DROP FUNCTION IF EXISTS update_products_updated_at();

-- Recriar a função com search_path seguro
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';