-- Permitir company_id NULL para integrações de admin
ALTER TABLE public.marketplace_integrations 
ALTER COLUMN company_id DROP NOT NULL;

-- Atualizar as políticas RLS para permitir super admins
DROP POLICY IF EXISTS "Users can view their company integrations" ON public.marketplace_integrations;
DROP POLICY IF EXISTS "Users can create integrations for their company" ON public.marketplace_integrations;
DROP POLICY IF EXISTS "Users can update their company integrations" ON public.marketplace_integrations;
DROP POLICY IF EXISTS "Users can delete their company integrations" ON public.marketplace_integrations;

-- Recriar políticas atualizadas
CREATE POLICY "Company scoped marketplace_integrations access" 
ON public.marketplace_integrations 
FOR ALL 
USING (can_access_company_data(company_id));

CREATE POLICY "Super admins can manage all marketplace_integrations" 
ON public.marketplace_integrations 
FOR ALL 
USING (is_super_admin());