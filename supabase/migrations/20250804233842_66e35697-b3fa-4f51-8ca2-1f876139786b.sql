-- Criar função get_user_company_id se não existir
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  company_uuid uuid;
BEGIN
  -- Buscar company_id do usuário logado
  SELECT company_id INTO company_uuid
  FROM public.user_companies
  WHERE user_id = auth.uid()
    AND is_active = true
  LIMIT 1;
  
  RETURN company_uuid;
END;
$$;

-- Verificar se existe usuário com empresa associada
-- Se não existir, criar uma empresa padrão para teste
DO $$
DECLARE
  current_user_id uuid;
  existing_company_id uuid;
  new_company_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Se há usuário logado
  IF current_user_id IS NOT NULL THEN
    -- Verificar se já tem empresa
    SELECT company_id INTO existing_company_id
    FROM public.user_companies
    WHERE user_id = current_user_id AND is_active = true
    LIMIT 1;
    
    -- Se não tem empresa, criar uma
    IF existing_company_id IS NULL THEN
      -- Criar empresa padrão
      INSERT INTO public.companies (name, document, email, user_id)
      VALUES ('Empresa Padrão', '00000000000001', 'empresa@exemplo.com', current_user_id)
      RETURNING id INTO new_company_id;
      
      -- Associar usuário à empresa
      INSERT INTO public.user_companies (user_id, company_id, role, is_active)
      VALUES (current_user_id, new_company_id, 'contratante', true);
    END IF;
  END IF;
END;
$$;