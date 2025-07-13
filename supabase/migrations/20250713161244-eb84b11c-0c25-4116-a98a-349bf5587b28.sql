-- Atualizar função para verificar se é super admin
-- Apenas murilloggomes@gmail.com deve ser considerado super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.user_id = auth.uid() 
      AND p.email = 'murilloggomes@gmail.com'
  );
END;
$$;

-- Atualizar função para verificar admin da empresa
-- Outros usuários são admins apenas da própria empresa
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Se for super admin, retorna true
  IF is_super_admin() THEN
    RETURN true;
  END IF;
  
  -- Senão, verifica se é admin da empresa
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_companies 
    WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
  );
END;
$$;

-- Criar função para auto-assinatura do plano básico
CREATE OR REPLACE FUNCTION public.auto_assign_basic_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  basic_plan_id uuid;
  user_company_id uuid;
  subscription_exists boolean;
BEGIN
  -- Buscar o plano básico
  SELECT id INTO basic_plan_id 
  FROM public.plans 
  WHERE name ILIKE '%básico%' OR name ILIKE '%basic%' OR name ILIKE '%starter%'
  AND active = true 
  LIMIT 1;
  
  -- Buscar a empresa do usuário recém criado
  SELECT company_id INTO user_company_id 
  FROM public.user_companies 
  WHERE user_id = NEW.user_id 
  AND is_active = true
  LIMIT 1;
  
  -- Verificar se já existe subscription para esta empresa
  SELECT EXISTS(
    SELECT 1 FROM public.subscriptions WHERE company_id = user_company_id
  ) INTO subscription_exists;
  
  -- Se encontrou plano e empresa, e não existe subscription, criar com trial de 30 dias
  IF basic_plan_id IS NOT NULL AND user_company_id IS NOT NULL AND NOT subscription_exists THEN
    INSERT INTO public.subscriptions (
      company_id,
      plan_id,
      status,
      trial_start_date,
      trial_end_date,
      start_date,
      created_at,
      updated_at
    ) VALUES (
      user_company_id,
      basic_plan_id,
      'trial',
      now(),
      now() + interval '30 days',
      now(),
      now(),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para auto-assinatura após criação de associação usuário-empresa
DROP TRIGGER IF EXISTS auto_assign_basic_plan_trigger ON public.user_companies;
CREATE TRIGGER auto_assign_basic_plan_trigger
  AFTER INSERT ON public.user_companies
  FOR EACH ROW 
  WHEN (NEW.role = 'admin')
  EXECUTE FUNCTION public.auto_assign_basic_plan();

-- Garantir que existe um plano básico (verificar se não existe antes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.plans WHERE name = 'Básico') THEN
    INSERT INTO public.plans (name, description, price, trial_days, active, features)
    VALUES (
      'Básico',
      'Plano básico com funcionalidades essenciais',
      0,
      30,
      true,
      '["nfe", "vendas", "estoque", "clientes", "produtos"]'::jsonb
    );
  END IF;
END $$;