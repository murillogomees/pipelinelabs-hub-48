-- Limpar todas as empresas vinculadas ao murilloggomes@gmail.com e criar uma empresa fictícia
-- Manter super admin com acesso global a tudo

-- 1. Buscar o user_id do murilloggomes@gmail.com
DO $$
DECLARE
  murillo_user_id uuid;
  dummy_company_id uuid;
BEGIN
  -- Buscar user_id do murilloggomes@gmail.com
  SELECT user_id INTO murillo_user_id 
  FROM public.profiles 
  WHERE email = 'murilloggomes@gmail.com';

  -- Se encontrou o usuário, limpar associações antigas
  IF murillo_user_id IS NOT NULL THEN
    -- Deletar todas as associações user_companies do murillo
    DELETE FROM public.user_companies WHERE user_id = murillo_user_id;
    
    -- Criar empresa fictícia para testes
    INSERT INTO public.companies (id, name, document, email, phone, address, city, state, zipcode)
    VALUES (
      gen_random_uuid(),
      'Pipeline Labs - Empresa Demo',
      '12.345.678/0001-90',
      'contato@pipelinelabs.com.br',
      '(11) 99999-9999',
      'Rua Demo, 123',
      'São Paulo',
      'SP',
      '01234-567'
    )
    RETURNING id INTO dummy_company_id;
    
    -- Associar murillo como admin da empresa demo
    INSERT INTO public.user_companies (user_id, company_id, role, is_active, permissions)
    VALUES (
      murillo_user_id,
      dummy_company_id,
      'admin',
      true,
      '{
        "full_access": true,
        "super_admin": true,
        "admin_panel": true,
        "user_management": true,
        "company_management": true,
        "system_settings": true,
        "plans_management": true,
        "integrations_management": true,
        "notifications_management": true,
        "reports_management": true,
        "financial_management": true,
        "billing_management": true,
        "global_access": true
      }'::jsonb
    );
    
    -- Criar configurações básicas para a empresa demo
    INSERT INTO public.company_settings (company_id, idioma, timezone, moeda)
    VALUES (dummy_company_id, 'pt-BR', 'America/Sao_Paulo', 'BRL');
    
    RAISE NOTICE 'Empresa demo criada com sucesso para murilloggomes@gmail.com';
  END IF;
END $$;

-- 2. Atualizar políticas RLS para dar acesso global ao super admin
-- Remover políticas específicas e recriar com acesso de super admin

-- Política para user_companies - super admin vê tudo
DROP POLICY IF EXISTS "Super admins can manage all user companies" ON public.user_companies;
CREATE POLICY "Super admins can manage all user companies" 
ON public.user_companies 
FOR ALL 
TO authenticated
USING (is_super_admin());

-- Política para profiles - super admin vê tudo
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (is_super_admin());

-- Política para subscriptions - super admin vê tudo  
DROP POLICY IF EXISTS "Super admins can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Super admins can manage all subscriptions" 
ON public.subscriptions 
FOR ALL 
TO authenticated
USING (is_super_admin());

-- Política para companies - super admin vê tudo
DROP POLICY IF EXISTS "Super admins can manage all companies" ON public.companies;
CREATE POLICY "Super admins can manage all companies" 
ON public.companies 
FOR ALL 
TO authenticated
USING (is_super_admin());

-- Adicionar políticas de acesso global para o super admin em todas as tabelas principais
CREATE POLICY "Super admin can view all customers" 
ON public.customers 
FOR SELECT 
TO authenticated
USING (is_super_admin());

CREATE POLICY "Super admin can view all products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (is_super_admin());

CREATE POLICY "Super admin can view all sales" 
ON public.sales 
FOR SELECT 
TO authenticated
USING (is_super_admin());

CREATE POLICY "Super admin can view all invoices" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (is_super_admin());

CREATE POLICY "Super admin can view all notifications" 
ON public.notifications 
FOR SELECT 
TO authenticated
USING (is_super_admin());

CREATE POLICY "Super admin can view all accounts_payable" 
ON public.accounts_payable 
FOR SELECT 
TO authenticated
USING (is_super_admin());

CREATE POLICY "Super admin can view all accounts_receivable" 
ON public.accounts_receivable 
FOR SELECT 
TO authenticated
USING (is_super_admin());

CREATE POLICY "Super admin can view all proposals" 
ON public.proposals 
FOR SELECT 
TO authenticated
USING (is_super_admin());

CREATE POLICY "Super admin can view all service_orders" 
ON public.service_orders 
FOR SELECT 
TO authenticated
USING (is_super_admin());

CREATE POLICY "Super admin can view all production_orders" 
ON public.production_orders 
FOR SELECT 
TO authenticated
USING (is_super_admin());

-- 3. Atualizar função get_user_company_id para super admin ver primeira empresa disponível ou sua própria
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Se for super admin, retorna a primeira empresa ativa encontrada (para funcionalidade normal)
  -- Senão, retorna a empresa do usuário atual
  SELECT CASE 
    WHEN is_super_admin() THEN (
      SELECT company_id FROM public.user_companies 
      WHERE user_id = auth.uid() AND is_active = true 
      LIMIT 1
    )
    ELSE (
      SELECT company_id FROM public.user_companies 
      WHERE user_id = auth.uid() AND is_active = true 
      LIMIT 1
    )
  END;
$$;