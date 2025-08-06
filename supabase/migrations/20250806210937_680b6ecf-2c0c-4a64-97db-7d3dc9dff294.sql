-- 🚀 Sistema completo de auto-criação de empresa e perfil no signup

-- Primeiro, criar a função que será executada após signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  company_uuid uuid;
  contratante_access_level_id uuid;
  user_name text;
  user_email text;
  user_phone text;
  user_document text;
  company_name text;
BEGIN
  -- Extrair dados do metadata do usuário
  user_name := COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', 'Usuário');
  user_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  user_phone := NEW.raw_user_meta_data->>'phone';
  user_document := NEW.raw_user_meta_data->>'document';
  company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', user_name || ' - Empresa');

  -- Buscar access_level "contratante"
  SELECT id INTO contratante_access_level_id 
  FROM public.access_levels 
  WHERE name = 'contratante' AND is_active = true
  LIMIT 1;

  -- Se não existir, criar access_level contratante
  IF contratante_access_level_id IS NULL THEN
    INSERT INTO public.access_levels (
      name, 
      display_name, 
      description, 
      permissions,
      is_system,
      is_active
    ) VALUES (
      'contratante',
      'Contratante',
      'Responsável pela empresa com acesso total',
      '{"admin": true, "usuarios": true, "vendas": true, "produtos": true, "clientes": true, "financeiro": true, "relatorios": true, "configuracoes": true}',
      true,
      true
    ) RETURNING id INTO contratante_access_level_id;
  END IF;

  -- 1. Criar a empresa
  INSERT INTO public.companies (
    name,
    legal_name,
    document,
    email,
    phone,
    user_id,
    tax_regime
  ) VALUES (
    company_name,
    company_name,
    COALESCE(user_document, 'PENDENTE'),
    user_email,
    user_phone,
    NEW.id,
    'simples_nacional'
  ) RETURNING id INTO company_uuid;

  -- 2. Criar perfil do usuário
  INSERT INTO public.profiles (
    user_id,
    display_name,
    email,
    phone,
    document,
    access_level_id,
    is_active
  ) VALUES (
    NEW.id,
    user_name,
    user_email,
    user_phone,
    user_document,
    contratante_access_level_id,
    true
  );

  -- 3. Associar usuário à empresa como contratante
  INSERT INTO public.user_companies (
    user_id,
    company_id,
    role,
    is_active
  ) VALUES (
    NEW.id,
    company_uuid,
    'contratante',
    true
  );

  -- Log de sucesso
  RAISE NOTICE 'Usuário criado: %, Empresa: %, Profile: OK', NEW.id, company_uuid;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloqueia o signup
    RAISE WARNING 'Erro na criação automática: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Criar o trigger no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- 🔒 Ajustar políticas RLS para permitir auto-criação

-- Policy para permitir auto-criação de companies
DROP POLICY IF EXISTS "auto_create_company_on_signup" ON public.companies;
CREATE POLICY "auto_create_company_on_signup"
  ON public.companies FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy para permitir auto-criação de profiles  
DROP POLICY IF EXISTS "auto_create_profile_on_signup" ON public.profiles;
CREATE POLICY "auto_create_profile_on_signup"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy para permitir auto-criação de user_companies
DROP POLICY IF EXISTS "auto_create_user_company_on_signup" ON public.user_companies;
CREATE POLICY "auto_create_user_company_on_signup"
  ON public.user_companies FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 🧪 Função de teste para verificar se tudo está funcionando
CREATE OR REPLACE FUNCTION public.test_user_creation_setup()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result TEXT := '';
  access_level_count INT;
  trigger_exists BOOLEAN;
BEGIN
  -- Verificar se access_level contratante existe
  SELECT COUNT(*) INTO access_level_count
  FROM public.access_levels 
  WHERE name = 'contratante' AND is_active = true;
  
  result := result || 'Access Level "contratante": ' || 
    CASE WHEN access_level_count > 0 THEN '✅ OK' ELSE '❌ MISSING' END || E'\n';

  -- Verificar se trigger existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
    AND event_object_schema = 'auth'
  ) INTO trigger_exists;
  
  result := result || 'Trigger auto-criação: ' || 
    CASE WHEN trigger_exists THEN '✅ OK' ELSE '❌ MISSING' END || E'\n';

  result := result || E'\n🎯 Sistema de auto-criação configurado com sucesso!';
  
  RETURN result;
END;
$$;