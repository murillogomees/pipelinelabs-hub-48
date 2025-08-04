-- Correção final simplificada para remover validate_password

-- 1. REMOVER FUNÇÕES validate_password COM QUALQUER ASSINATURA
DROP FUNCTION IF EXISTS public.validate_password(text) CASCADE;
DROP FUNCTION IF EXISTS public.validate_password(varchar) CASCADE;
DROP FUNCTION IF EXISTS public.validate_password(character varying) CASCADE;

-- 2. PROCURAR E REMOVER OUTRAS FUNÇÕES COM NOMES SIMILARES NO SCHEMA PUBLIC
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname LIKE '%validate_password%'
          AND n.nspname = 'public'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE;',
                      func_record.proname,
                      func_record.args);
    END LOOP;
END $$;

-- 3. REMOVER TRIGGERS QUE POSSAM ESTAR REFERENCIANDO validate_password NA TABELA auth.users
-- Como não podemos modificar o schema auth diretamente, vamos garantir que não há referências no public
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT t.tgname as trigger_name, c.relname as table_name, n.nspname as schema_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE n.nspname = 'public'
          AND p.proname LIKE '%validate_password%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE;',
                      trigger_record.trigger_name,
                      trigger_record.schema_name,
                      trigger_record.table_name);
    END LOOP;
END $$;

-- 4. GARANTIR QUE A FUNÇÃO handle_new_user ESTÁ LIMPA
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