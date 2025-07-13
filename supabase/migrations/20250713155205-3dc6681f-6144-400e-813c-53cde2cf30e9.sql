-- Criar planos básicos do sistema
INSERT INTO public.plans (
  id,
  name,
  description,
  price,
  user_limit,
  trial_days,
  features,
  active,
  is_custom,
  is_whitelabel,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'Starter',
  'Plano básico ideal para começar',
  29.90,
  1,
  30,
  '["vendas", "clientes", "produtos", "estoque_basico", "relatorios_basicos"]',
  true,
  false,
  false,
  now(),
  now()
),
(
  gen_random_uuid(),
  'Professional',
  'Plano completo para empresas em crescimento',
  79.90,
  5,
  30,
  '["vendas", "clientes", "produtos", "estoque_avancado", "financeiro", "nfe", "pos", "relatorios_avancados", "integracoes_basicas"]',
  true,
  false,
  false,
  now(),
  now()
),
(
  gen_random_uuid(),
  'Enterprise',
  'Plano para grandes empresas com recursos ilimitados',
  199.90,
  50,
  30,
  '["vendas", "clientes", "produtos", "estoque_avancado", "financeiro", "nfe", "pos", "relatorios_avancados", "integracoes_avancadas", "producao", "multi_usuarios", "api_access", "suporte_prioritario"]',
  true,
  false,
  false,
  now(),
  now()
);

-- Função para criar subscription automática para novos usuários
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  starter_plan_id uuid;
  user_company_id uuid;
BEGIN
  -- Buscar o plano Starter
  SELECT id INTO starter_plan_id FROM public.plans WHERE name = 'Starter' AND active = true LIMIT 1;
  
  -- Buscar a empresa do usuário
  SELECT company_id INTO user_company_id FROM public.user_companies WHERE user_id = NEW.user_id LIMIT 1;
  
  -- Se encontrou plano e empresa, criar subscription
  IF starter_plan_id IS NOT NULL AND user_company_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (
      id,
      company_id,
      plan_id,
      status,
      trial_start_date,
      trial_end_date,
      start_date,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      user_company_id,
      starter_plan_id,
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

-- Trigger para criar subscription quando um perfil é criado
CREATE TRIGGER create_subscription_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_subscription();

-- Atualizar a subscription existente da Pipeline Labs para o plano Professional
DO $$
DECLARE
  company_uuid uuid;
  professional_plan_id uuid;
BEGIN
  -- Buscar empresa Pipeline Labs
  SELECT id INTO company_uuid FROM public.companies WHERE name = 'Pipeline Labs' LIMIT 1;
  
  -- Buscar plano Professional
  SELECT id INTO professional_plan_id FROM public.plans WHERE name = 'Professional' LIMIT 1;
  
  -- Criar subscription para Pipeline Labs
  IF company_uuid IS NOT NULL AND professional_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (
      id,
      company_id,
      plan_id,
      status,
      start_date,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      company_uuid,
      professional_plan_id,
      'active',
      now(),
      now(),
      now()
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;