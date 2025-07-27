
-- Primeiro, vamos adicionar campos necessários na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_level_id UUID REFERENCES public.access_levels(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_access_level_id ON public.profiles(access_level_id);
CREATE INDEX IF NOT EXISTS idx_profiles_document ON public.profiles(document);

-- Atualizar a função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_access_level_id UUID;
BEGIN
  -- Buscar o nível de acesso padrão (operador)
  SELECT id INTO default_access_level_id
  FROM public.access_levels
  WHERE name = 'operador' AND is_active = true
  LIMIT 1;

  -- Se não encontrar operador, buscar qualquer nível ativo
  IF default_access_level_id IS NULL THEN
    SELECT id INTO default_access_level_id
    FROM public.access_levels
    WHERE is_active = true
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- Inserir o perfil do usuário
  INSERT INTO public.profiles (
    user_id,
    email,
    display_name,
    is_active,
    access_level_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    true,
    default_access_level_id,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Recriar o trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função para obter permissões do usuário baseado no access_level
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_permissions JSONB := '{}';
  user_access_level_id UUID;
BEGIN
  -- Buscar o access_level_id do usuário
  SELECT access_level_id INTO user_access_level_id
  FROM public.profiles
  WHERE user_id = user_uuid AND is_active = true;

  -- Se não encontrar, retornar permissões vazias
  IF user_access_level_id IS NULL THEN
    RETURN '{}';
  END IF;

  -- Buscar as permissões do access_level
  SELECT COALESCE(permissions, '{}') INTO user_permissions
  FROM public.access_levels
  WHERE id = user_access_level_id AND is_active = true;

  RETURN user_permissions;
END;
$$;

-- Atualizar função is_super_admin para usar access_levels
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  access_level_name TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Buscar o nome do access_level do usuário
  SELECT al.name INTO access_level_name
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = current_user_id AND p.is_active = true AND al.is_active = true;

  RETURN COALESCE(access_level_name = 'super_admin', false);
END;
$$;

-- Atualizar função is_contratante para usar access_levels
CREATE OR REPLACE FUNCTION public.is_contratante(company_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  access_level_name TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Buscar o nome do access_level do usuário
  SELECT al.name INTO access_level_name
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = current_user_id AND p.is_active = true AND al.is_active = true;

  RETURN COALESCE(access_level_name IN ('super_admin', 'contratante'), false);
END;
$$;

-- Atualizar função is_operador para usar access_levels
CREATE OR REPLACE FUNCTION public.is_operador(company_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  access_level_name TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Buscar o nome do access_level do usuário
  SELECT al.name INTO access_level_name
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = current_user_id AND p.is_active = true AND al.is_active = true;

  RETURN COALESCE(access_level_name = 'operador', false);
END;
$$;

-- Função para verificar permissão específica
CREATE OR REPLACE FUNCTION public.has_permission(permission_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  user_permissions JSONB;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Super admin tem todas as permissões
  IF is_super_admin() THEN
    RETURN true;
  END IF;

  -- Buscar permissões do usuário
  user_permissions := get_user_permissions(current_user_id);

  -- Verificar se a permissão existe e está ativa
  RETURN COALESCE((user_permissions->>permission_key)::BOOLEAN, false);
END;
$$;

-- Remover tabela user_companies que não será mais necessária
DROP TABLE IF EXISTS public.user_companies CASCADE;

-- Criar níveis de acesso padrão se não existirem
INSERT INTO public.access_levels (name, display_name, description, permissions, is_system, is_active)
VALUES 
  ('super_admin', 'Super Administrador', 'Acesso total ao sistema', 
   '{"dashboard": true, "vendas": true, "produtos": true, "clientes": true, "compras": true, "estoque": true, "financeiro": true, "notas_fiscais": true, "producao": true, "contratos": true, "relatorios": true, "analytics": true, "marketplace_canais": true, "integracoes": true, "configuracoes": true, "admin_panel": true, "user_management": true, "company_management": true, "system_settings": true}',
   true, true),
  ('contratante', 'Contratante', 'Acesso de administrador da empresa', 
   '{"dashboard": true, "vendas": true, "produtos": true, "clientes": true, "compras": true, "estoque": true, "financeiro": true, "notas_fiscais": true, "producao": true, "contratos": true, "relatorios": true, "analytics": true, "marketplace_canais": true, "integracoes": true, "configuracoes": true, "user_management": true}',
   true, true),
  ('operador', 'Operador', 'Acesso básico para operações', 
   '{"dashboard": true, "vendas": true, "produtos": true, "clientes": true, "compras": true, "estoque": true, "producao": true, "relatorios": true}',
   true, true)
ON CONFLICT (name) DO NOTHING;

-- Atualizar usuários existentes para ter um access_level_id
UPDATE public.profiles 
SET access_level_id = (
  SELECT id FROM public.access_levels 
  WHERE name = 'operador' AND is_active = true 
  LIMIT 1
)
WHERE access_level_id IS NULL;
