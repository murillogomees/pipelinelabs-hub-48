-- Correção final para remover todas as referências à função validate_password

-- 1. REMOVER TODOS OS TRIGGERS QUE POSSAM ESTAR REFERENCIANDO validate_password
DO $$ 
DECLARE 
    trigger_record RECORD;
BEGIN
    -- Buscar e remover triggers que referenciam validate_password
    FOR trigger_record IN 
        SELECT schemaname, tablename, triggername 
        FROM pg_triggers 
        WHERE trigger_definition LIKE '%validate_password%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE;', 
                      trigger_record.triggername, 
                      trigger_record.schemaname, 
                      trigger_record.tablename);
    END LOOP;
END $$;

-- 2. REMOVER CONSTRAINTS QUE POSSAM REFERENCIAR validate_password
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT conname, conrelid::regclass as table_name
        FROM pg_constraint
        WHERE consrc LIKE '%validate_password%'
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I CASCADE;',
                      constraint_record.table_name,
                      constraint_record.conname);
    END LOOP;
END $$;

-- 3. REMOVER FUNÇÕES validate_password COM QUALQUER ASSINATURA
DROP FUNCTION IF EXISTS public.validate_password(text) CASCADE;
DROP FUNCTION IF EXISTS public.validate_password(varchar) CASCADE;
DROP FUNCTION IF EXISTS public.validate_password(character varying) CASCADE;

-- 4. VERIFICAR SE HÁ OUTRAS FUNÇÕES COM NOMES SIMILARES
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc
        WHERE proname LIKE '%validate_password%'
          AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE;',
                      func_record.proname,
                      func_record.args);
    END LOOP;
END $$;

-- 5. GARANTIR QUE A FUNÇÃO handle_new_user ESTÁ CORRETA E SEM REFERÊNCIAS PROBLEMÁTICAS
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