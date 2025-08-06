-- 🔐 Melhoria de Segurança: Criação de triggers e funções para signup automático com company

-- 1. Função para criar company automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_company_id uuid;
  default_access_level_id uuid;
BEGIN
  -- Buscar access level padrão 'contratante'
  SELECT id INTO default_access_level_id
  FROM public.access_levels
  WHERE name = 'contratante' AND is_active = true
  LIMIT 1;
  
  -- Se não encontrar, criar um
  IF default_access_level_id IS NULL THEN
    INSERT INTO public.access_levels (name, display_name, permissions, is_active)
    VALUES (
      'contratante',
      'Contratante',
      '{"admin": true, "vendas": true, "produtos": true, "clientes": true, "financeiro": true, "relatorios": true}',
      true
    )
    RETURNING id INTO default_access_level_id;
  END IF;

  -- Criar company automaticamente se não existe
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
    INSERT INTO public.companies (
      name,
      document,
      email,
      user_id
    ) VALUES (
      NEW.raw_user_meta_data->>'company_name',
      COALESCE(NEW.raw_user_meta_data->>'document', ''),
      NEW.email,
      NEW.id
    )
    RETURNING id INTO new_company_id;
  ELSE
    -- Criar company padrão com email do usuário
    INSERT INTO public.companies (
      name,
      document,
      email,
      user_id
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'display_name', 'Minha Empresa'),
      COALESCE(NEW.raw_user_meta_data->>'document', ''),
      NEW.email,
      NEW.id
    )
    RETURNING id INTO new_company_id;
  END IF;

  -- Criar perfil do usuário
  INSERT INTO public.profiles (
    user_id,
    email,
    display_name,
    document,
    phone,
    company_id,
    access_level_id,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'document', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    new_company_id,
    default_access_level_id,
    true
  );

  -- Criar relação user_companies
  INSERT INTO public.user_companies (
    user_id,
    company_id,
    role,
    is_active
  ) VALUES (
    NEW.id,
    new_company_id,
    'contratante',
    true
  );

  -- Log de auditoria
  PERFORM create_audit_log(
    new_company_id,
    'user:signup_with_company',
    'user',
    NEW.id::text,
    null,
    jsonb_build_object(
      'email', NEW.email,
      'company_id', new_company_id,
      'signup_timestamp', now()
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debugging
    RAISE WARNING 'Erro no trigger handle_new_user_signup: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- 2. Criar trigger para signup automático
DROP TRIGGER IF EXISTS on_auth_user_created_signup ON auth.users;
CREATE TRIGGER on_auth_user_created_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_signup();

-- 3. Função para validar rate limiting no signup
CREATE OR REPLACE FUNCTION public.check_signup_rate_limit(p_email text, p_ip_address inet DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  signup_count integer;
  ip_signup_count integer;
BEGIN
  -- Verificar rate limit por email (máximo 3 tentativas por hora)
  SELECT COUNT(*) INTO signup_count
  FROM auth.users
  WHERE email = p_email
    AND created_at > now() - interval '1 hour';
    
  IF signup_count >= 3 THEN
    -- Log tentativa de spam
    PERFORM log_security_event(
      'signup_rate_limit_exceeded',
      null,
      p_ip_address,
      null,
      jsonb_build_object('email', p_email, 'attempts', signup_count),
      'medium'
    );
    RETURN false;
  END IF;
  
  -- Verificar rate limit por IP (máximo 10 tentativas por hora)
  IF p_ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO ip_signup_count
    FROM public.security_audit_logs
    WHERE ip_address = p_ip_address
      AND event_type = 'signup_attempt'
      AND created_at > now() - interval '1 hour';
      
    IF ip_signup_count >= 10 THEN
      PERFORM log_security_event(
        'signup_ip_rate_limit_exceeded',
        null,
        p_ip_address,
        null,
        jsonb_build_object('ip_attempts', ip_signup_count),
        'high'
      );
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$function$;

-- 4. Melhorar índices para performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON public.customers(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_user_company ON public.user_companies(user_id, company_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_active ON public.user_companies(company_id, is_active) WHERE is_active = true;

-- 5. Função otimizada para buscar dados por company
CREATE OR REPLACE FUNCTION public.get_company_data_optimized(
  p_table_name text,
  p_columns text DEFAULT '*',
  p_where_clause text DEFAULT '',
  p_limit integer DEFAULT 25,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(data jsonb, total_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_company_id uuid;
  query_text text;
  count_query text;
  result_data jsonb;
  total_records bigint;
BEGIN
  -- Obter company_id do usuário atual
  SELECT get_user_company_id() INTO current_company_id;
  
  IF current_company_id IS NULL AND NOT is_super_admin() THEN
    RETURN QUERY SELECT '[]'::jsonb, 0::bigint;
    RETURN;
  END IF;
  
  -- Construir query com segurança
  query_text := format(
    'SELECT json_agg(row_to_json(t.*)) FROM (SELECT %s FROM %I WHERE %s %s company_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3) t',
    p_columns,
    p_table_name,
    CASE WHEN p_where_clause = '' THEN '' ELSE p_where_clause || ' AND ' END,
    CASE WHEN is_super_admin() THEN 'TRUE OR ' ELSE '' END
  );
  
  count_query := format(
    'SELECT COUNT(*) FROM %I WHERE %s %s company_id = $1',
    p_table_name,
    CASE WHEN p_where_clause = '' THEN '' ELSE p_where_clause || ' AND ' END,
    CASE WHEN is_super_admin() THEN 'TRUE OR ' ELSE '' END
  );
  
  -- Executar queries
  EXECUTE query_text INTO result_data USING current_company_id, p_limit, p_offset;
  EXECUTE count_query INTO total_records USING current_company_id;
  
  RETURN QUERY SELECT COALESCE(result_data, '[]'::jsonb), total_records;
END;
$function$;