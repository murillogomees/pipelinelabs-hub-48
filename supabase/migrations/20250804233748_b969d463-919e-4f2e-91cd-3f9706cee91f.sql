-- Verificar se existe algum trigger ou referência à função validate_password
-- e criar a função validate_password se ela for necessária

-- Função para validar força da senha
CREATE OR REPLACE FUNCTION public.validate_password(password_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validação básica de senha
  -- Mínimo 8 caracteres
  IF LENGTH(password_text) < 8 THEN
    RETURN false;
  END IF;
  
  -- Pelo menos uma letra maiúscula
  IF password_text !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Pelo menos uma letra minúscula  
  IF password_text !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Pelo menos um número
  IF password_text !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;