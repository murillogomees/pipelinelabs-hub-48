-- Ajustar RLS policies para permitir que admins criem empresas
-- E permitir que usuários vejam empresas

-- Primeiro, remover as policies existentes da tabela companies
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their companies" ON public.companies;

-- Criar policies mais permissivas para companies
-- Permitir que usuários autenticados vejam todas as empresas
CREATE POLICY "Authenticated users can view companies" 
ON public.companies 
FOR SELECT 
TO authenticated
USING (true);

-- Permitir que admins criem empresas
CREATE POLICY "Admins can create companies" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_current_user_admin());

-- Permitir que admins atualizem empresas
CREATE POLICY "Admins can update companies" 
ON public.companies 
FOR UPDATE 
TO authenticated
USING (public.is_current_user_admin());

-- Permitir que admins deletem empresas
CREATE POLICY "Admins can delete companies" 
ON public.companies 
FOR DELETE 
TO authenticated
USING (public.is_current_user_admin());