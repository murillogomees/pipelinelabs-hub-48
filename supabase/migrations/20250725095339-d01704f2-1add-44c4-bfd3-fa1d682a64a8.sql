-- Adicionar políticas RLS para super_admin ter acesso total ao sistema
-- O super_admin deve poder fazer tudo, independente de plano ou empresa

-- Política para super_admin acessar todas as empresas
CREATE OR REPLACE POLICY "Super admins can manage all companies"
ON public.companies
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todos os usuários
CREATE OR REPLACE POLICY "Super admins can manage all users"
ON public.user_companies
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todos os produtos
CREATE OR REPLACE POLICY "Super admins can manage all products"
ON public.products
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todos os clientes
CREATE OR REPLACE POLICY "Super admins can manage all customers"
ON public.customers
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todas as vendas
CREATE OR REPLACE POLICY "Super admins can manage all sales"
ON public.sales
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todas as compras
CREATE OR REPLACE POLICY "Super admins can manage all purchases"
ON public.purchase_orders
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todo o estoque
CREATE OR REPLACE POLICY "Super admins can manage all stock"
ON public.stock_movements
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todo o financeiro
CREATE OR REPLACE POLICY "Super admins can manage all financial data"
ON public.financial_transactions
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todas as notas fiscais
CREATE OR REPLACE POLICY "Super admins can manage all invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todas as configurações
CREATE OR REPLACE POLICY "Super admins can manage all company settings"
ON public.company_settings
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todos os relatórios
CREATE OR REPLACE POLICY "Super admins can access all analytics"
ON public.analytics_events
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Política para super_admin acessar todas as integrações
CREATE OR REPLACE POLICY "Super admins can manage all integrations"
ON public.company_integrations
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Atualizar função is_super_admin para ser mais robusta
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  -- Se não há usuário logado, retornar false
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se o usuário tem role super_admin na tabela user_companies
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    WHERE uc.user_id = current_user_id
      AND uc.user_type = 'super_admin'
      AND uc.is_active = true
  );
END;
$function$;

-- Função para verificar se usuário pode bypassed todas as restrições
CREATE OR REPLACE FUNCTION public.can_bypass_all_restrictions()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Super admin pode bypass tudo
  RETURN is_super_admin();
END;
$function$;