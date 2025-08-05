-- Criar função get_user_company_id se não existir
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_company_id UUID;
BEGIN
  -- Se não há usuário autenticado, retornar null
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  -- Buscar company_id do usuário através da relação user_companies
  SELECT uc.company_id INTO user_company_id
  FROM public.user_companies uc
  WHERE uc.user_id = auth.uid()
    AND uc.is_active = true
  LIMIT 1;

  -- Se não encontrou, buscar através do campo companie_id em profiles
  IF user_company_id IS NULL THEN
    SELECT p.companie_id INTO user_company_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.companie_id IS NOT NULL
    LIMIT 1;
  END IF;

  -- Se ainda não encontrou, usar empresa padrão (primeira empresa disponível)
  IF user_company_id IS NULL THEN
    SELECT c.id INTO user_company_id
    FROM public.companies c
    ORDER BY c.created_at ASC
    LIMIT 1;
  END IF;

  RETURN user_company_id;
END;
$$;

-- Criar função has_specific_permission se não existir adequadamente
CREATE OR REPLACE FUNCTION public.has_specific_permission(permission_name TEXT, company_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_access_level TEXT;
  target_company_id UUID;
  user_role TEXT;
BEGIN
  -- Se não há usuário autenticado, retornar false
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Super admin pode tudo
  IF is_super_admin() THEN
    RETURN true;
  END IF;

  -- Usar company_uuid fornecido ou buscar empresa do usuário
  target_company_id := COALESCE(company_uuid, get_user_company_id());

  -- Se não há empresa, permitir apenas para super admin
  IF target_company_id IS NULL THEN
    RETURN is_super_admin();
  END IF;

  -- Buscar o role do usuário na empresa
  SELECT uc.role INTO user_role
  FROM public.user_companies uc
  WHERE uc.user_id = auth.uid()
    AND uc.company_id = target_company_id
    AND uc.is_active = true;

  -- Se é contratante da empresa, tem todas as permissões
  IF user_role = 'contratante' THEN
    RETURN true;
  END IF;

  -- Buscar nível de acesso do usuário
  SELECT al.name INTO user_access_level
  FROM public.profiles p
  JOIN public.access_levels al ON p.access_level_id = al.id
  WHERE p.user_id = auth.uid()
    AND p.is_active = true
    AND al.is_active = true;

  -- Verificar permissões específicas baseadas no nível de acesso
  CASE user_access_level
    WHEN 'super_admin' THEN
      RETURN true;
    WHEN 'contratante' THEN
      RETURN true;
    WHEN 'operador' THEN
      -- Operadores têm acesso limitado mas podem ver produtos
      RETURN permission_name IN ('produtos', 'vendas', 'clientes', 'estoque');
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Atualizar políticas de produtos para funcionar melhor
DROP POLICY IF EXISTS "Company management of products" ON public.products;
DROP POLICY IF EXISTS "Company access to products" ON public.products;
DROP POLICY IF EXISTS "Company update of products" ON public.products;
DROP POLICY IF EXISTS "Company delete of products" ON public.products;

-- Política de SELECT mais permissiva
CREATE POLICY "Company access to products"
ON public.products
FOR SELECT
USING (
  -- Super admin pode ver tudo
  is_super_admin() OR 
  -- Usuários autenticados podem ver produtos da sua empresa
  (auth.uid() IS NOT NULL AND can_access_company_data(company_id)) OR
  -- Fallback: se não tem empresa específica, mostrar produtos da empresa padrão
  (company_id = get_default_company_id())
);

-- Política de INSERT
CREATE POLICY "Company management of products"
ON public.products
FOR INSERT
WITH CHECK (
  -- Super admin pode inserir em qualquer empresa
  is_super_admin() OR
  -- Usuários com permissão podem inserir na sua empresa
  (auth.uid() IS NOT NULL AND 
   can_access_company_data(COALESCE(company_id, get_user_company_id())) AND
   has_specific_permission('produtos', COALESCE(company_id, get_user_company_id())))
);

-- Política de UPDATE
CREATE POLICY "Company update of products"
ON public.products
FOR UPDATE
USING (
  is_super_admin() OR
  (auth.uid() IS NOT NULL AND 
   can_access_company_data(company_id) AND 
   has_specific_permission('produtos', company_id))
);

-- Política de DELETE
CREATE POLICY "Company delete of products"
ON public.products
FOR DELETE
USING (
  is_super_admin() OR
  (auth.uid() IS NOT NULL AND 
   can_manage_company_data(company_id) AND 
   has_specific_permission('produtos', company_id))
);