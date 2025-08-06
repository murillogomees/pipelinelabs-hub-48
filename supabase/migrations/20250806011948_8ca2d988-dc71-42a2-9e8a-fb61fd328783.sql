-- Atualizar políticas RLS da tabela customers para permitir acesso total do super admin

-- Remover políticas antigas
DROP POLICY IF EXISTS "Company customers access" ON public.customers;
DROP POLICY IF EXISTS "Company customers delete" ON public.customers;
DROP POLICY IF EXISTS "Company customers insert" ON public.customers;
DROP POLICY IF EXISTS "Company customers update" ON public.customers;

-- Criar novas políticas que permitem super admin acessar tudo

-- Policy para SELECT: Super admin vê tudo, outros usuários só da sua empresa
CREATE POLICY "Customers access policy"
ON public.customers
FOR SELECT
USING (is_super_admin() OR can_access_company_data(company_id));

-- Policy para INSERT: Super admin pode inserir em qualquer empresa, outros só na sua
CREATE POLICY "Customers insert policy"
ON public.customers
FOR INSERT
WITH CHECK (is_super_admin() OR (can_access_company_data(company_id) AND company_id = get_user_company_id()));

-- Policy para UPDATE: Super admin pode atualizar qualquer registro, outros só da sua empresa
CREATE POLICY "Customers update policy"
ON public.customers
FOR UPDATE
USING (is_super_admin() OR can_access_company_data(company_id))
WITH CHECK (is_super_admin() OR can_access_company_data(company_id));

-- Policy para DELETE: Super admin pode deletar qualquer registro, outros só da sua empresa
CREATE POLICY "Customers delete policy"
ON public.customers
FOR DELETE
USING (is_super_admin() OR can_access_company_data(company_id));