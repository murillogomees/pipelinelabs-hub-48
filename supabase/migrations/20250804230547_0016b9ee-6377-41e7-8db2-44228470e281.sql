-- Correção final para remover todas as referências à função validate_password

-- 1. REMOVER FUNÇÕES validate_password COM QUALQUER ASSINATURA
DROP FUNCTION IF EXISTS public.validate_password(text) CASCADE;
DROP FUNCTION IF EXISTS public.validate_password(varchar) CASCADE;
DROP FUNCTION IF EXISTS public.validate_password(character varying) CASCADE;

-- 2. VERIFICAR E REMOVER TRIGGERS NA TABELA auth.users QUE POSSAM ESTAR CAUSANDO O PROBLEMA
DO $$
DECLARE
    trigger_name TEXT;
BEGIN
    -- Verificar triggers específicos na tabela auth.users
    FOR trigger_name IN
        SELECT tgname
        FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'users' AND n.nspname = 'auth'
        AND EXISTS (
            SELECT 1 FROM pg_proc p
            WHERE p.oid = t.tgfoid
            AND p.prosrc LIKE '%validate_password%'
        )
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE;', trigger_name);
        EXCEPTION
            WHEN OTHERS THEN
                -- Ignorar erros de permissão
                NULL;
        END;
    END LOOP;
END $$;

-- 3. LIMPAR QUALQUER FUNÇÃO QUE POSSA ESTAR CAUSANDO PROBLEMA
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT p.proname, n.nspname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.proname LIKE '%password%'
          AND n.nspname = 'public'
          AND p.prosrc LIKE '%validate%'
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE;',
                          func_record.nspname,
                          func_record.proname,
                          func_record.args);
        EXCEPTION
            WHEN OTHERS THEN
                -- Continuar mesmo se der erro
                NULL;
        END;
    END LOOP;
END $$;

-- 4. GARANTIR QUE A FUNÇÃO handle_new_user ESTÁ CORRETA
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  default_company_id uuid;
  basic_access_level_id uuid;
  pipeline_company_id uuid;
BEGIN
  -- Buscar empresa Pipeline Labs como padrão
  SELECT id INTO pipeline_company_id 
  FROM public.companies 
  WHERE name = 'Pipeline Labs' 
  LIMIT 1;
  
  -- Se não existir Pipeline Labs, usar primeira empresa disponível
  IF pipeline_company_id IS NULL THEN
    SELECT id INTO default_company_id 
    FROM public.companies 
    ORDER BY created_at ASC 
    LIMIT 1;
  ELSE
    default_company_id := pipeline_company_id;
  END IF;
  
  -- Se não há nenhuma empresa, criar uma padrão
  IF default_company_id IS NULL THEN
    INSERT INTO public.companies (name, document, email)
    VALUES ('Empresa Padrão', '00000000000000', 'contato@empresa.com')
    RETURNING id INTO default_company_id;
  END IF;
  
  -- Buscar access_level básico
  SELECT id INTO basic_access_level_id 
  FROM public.access_levels 
  WHERE name = 'operador' AND is_active = true
  LIMIT 1;
  
  -- Se não existir access_level, criar um básico
  IF basic_access_level_id IS NULL THEN
    INSERT INTO public.access_levels (name, display_name, description, permissions, is_active)
    VALUES ('operador', 'Operador', 'Usuário operador básico', '{"basic": true}', true)
    RETURNING id INTO basic_access_level_id;
  END IF;
  
  -- Criar perfil do usuário
  INSERT INTO public.profiles (
    user_id,
    email,
    display_name,
    access_level_id,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    basic_access_level_id,
    true
  );
  
  -- Associar usuário à empresa
  INSERT INTO public.user_companies (
    user_id,
    company_id,
    role,
    is_active
  ) VALUES (
    NEW.id,
    default_company_id,
    'operador',
    true
  );
  
  RETURN NEW;
END;
$$;