-- Correção final para remover todas as referências à função validate_password

-- 1. REMOVER TODOS OS TRIGGERS QUE POSSAM ESTAR REFERENCIANDO validate_password
-- Usar pg_trigger e pg_proc para encontrar triggers
DO $$ 
DECLARE 
    trigger_record RECORD;
BEGIN
    -- Buscar e remover triggers que referenciam validate_password
    FOR trigger_record IN 
        SELECT n.nspname as schema_name, c.relname as table_name, t.tgname as trigger_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE p.proname LIKE '%validate_password%'
           OR t.tgname LIKE '%validate_password%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE;', 
                      trigger_record.trigger_name, 
                      trigger_record.schema_name, 
                      trigger_record.table_name);
    END LOOP;
END $$;

-- 2. REMOVER CONSTRAINTS QUE POSSAM REFERENCIAR validate_password
-- Usar information_schema para constraints
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT constraint_name, table_name
        FROM information_schema.check_constraints
        WHERE check_clause LIKE '%validate_password%'
    LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I CASCADE;',
                      constraint_record.table_name,
                      constraint_record.constraint_name);
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

-- 5. REMOVER QUALQUER TRIGGER NO SCHEMA auth QUE POSSA ESTAR CAUSANDO PROBLEMAS
DO $$
DECLARE
    auth_trigger RECORD;
BEGIN
    FOR auth_trigger IN
        SELECT t.tgname as trigger_name, c.relname as table_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE n.nspname = 'auth' 
          AND (p.proname LIKE '%validate_password%' OR p.proname LIKE '%password%')
    LOOP
        -- Só remover se não for um trigger do sistema Supabase
        IF auth_trigger.trigger_name NOT LIKE 'on_auth_%' THEN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.%I CASCADE;', 
                          auth_trigger.trigger_name, 
                          auth_trigger.table_name);
        END IF;
    END LOOP;
END $$;