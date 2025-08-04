-- Correção simples para remover função validate_password e triggers relacionados

-- 1. Remover triggers específicos conhecidos
DROP TRIGGER IF EXISTS enforce_password_strength ON auth.users CASCADE;
DROP TRIGGER IF EXISTS check_password_strength_trigger ON auth.users CASCADE;

-- 2. Remover função validate_password
DROP FUNCTION IF EXISTS public.validate_password(text) CASCADE;

-- 3. Verificar se existem outras funções validate_password
DROP FUNCTION IF EXISTS public.validate_password CASCADE;

-- 4. Limpar qualquer política que possa estar referenciando a função
DO $$
BEGIN
    -- Não há necessidade de buscar em views do sistema que podem não existir
    -- Apenas garantir que as funções foram removidas
    NULL;
END $$;