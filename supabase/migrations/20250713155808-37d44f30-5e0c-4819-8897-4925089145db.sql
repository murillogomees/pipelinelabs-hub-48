-- Garantir que murilloggomes@gmail.com seja super administrador do sistema
UPDATE public.user_companies 
SET 
  role = 'admin',
  permissions = '{
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
  }'::jsonb,
  is_active = true
WHERE user_id = (
  SELECT user_id FROM public.profiles WHERE email = 'murilloggomes@gmail.com'
);

-- Criar função para verificar se o usuário é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    JOIN public.profiles p ON p.user_id = uc.user_id
    WHERE p.user_id = auth.uid() 
      AND uc.role = 'admin' 
      AND uc.is_active = true
      AND (uc.permissions->>'super_admin')::boolean = true
  );
END;
$$;

-- Atualizar políticas RLS para permitir acesso de super admin
-- Política para tabela companies
CREATE POLICY "Super admins can manage all companies" 
ON public.companies
FOR ALL
USING (is_super_admin());

-- Política para tabela plans
CREATE POLICY "Super admins can manage all plans" 
ON public.plans
FOR ALL
USING (is_super_admin());

-- Política para tabela subscriptions
CREATE POLICY "Super admins can manage all subscriptions" 
ON public.subscriptions
FOR ALL
USING (is_super_admin());

-- Política para tabela user_companies
CREATE POLICY "Super admins can manage all user companies" 
ON public.user_companies
FOR ALL
USING (is_super_admin());

-- Política para tabela integrations_available
CREATE POLICY "Super admins can manage all integrations" 
ON public.integrations_available
FOR ALL
USING (is_super_admin());