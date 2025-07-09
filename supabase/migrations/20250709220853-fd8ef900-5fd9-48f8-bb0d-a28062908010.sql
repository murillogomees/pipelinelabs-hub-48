-- Criar tabela de planos
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  user_limit INTEGER,
  is_whitelabel BOOLEAN DEFAULT false,
  trial_days INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  is_custom BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, expired, trial
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  price_paid DECIMAL(10,2),
  payment_method TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies para plans
CREATE POLICY "Everyone can view active plans" ON public.plans
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage plans" ON public.plans
  FOR ALL
  USING (is_current_user_admin());

-- RLS Policies para subscriptions
CREATE POLICY "Company scoped select subscriptions" ON public.subscriptions
  FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL
  USING (is_current_user_admin());

CREATE POLICY "Company scoped insert subscriptions" ON public.subscriptions
  FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company scoped update subscriptions" ON public.subscriptions
  FOR UPDATE
  USING (company_id = get_user_company_id());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir os planos padrão
INSERT INTO public.plans (name, price, description, user_limit, trial_days, features, is_custom, active) VALUES
('Plano Básico', 149.00, 'Ideal para pequenos negócios que estão começando', 1, 30, '["Dashboard básico", "Gestão de vendas", "Controle de estoque básico", "Emissão de NFe", "Suporte por email"]'::jsonb, false, true),
('Plano Econômico', 219.00, 'Para empresas em crescimento que precisam de mais funcionalidades', 5, 0, '["Dashboard completo", "Gestão de vendas avançada", "Controle de estoque completo", "Emissão de NFe/NFSe", "Gestão financeira", "Relatórios básicos", "Suporte prioritário"]'::jsonb, false, true),
('Plano Completo', 389.00, 'Solução completa para empresas consolidadas', 20, 0, '["Todas as funcionalidades", "Dashboard executivo", "Gestão multicanal", "Automações", "Relatórios avançados", "Integrações", "API completa", "Suporte premium"]'::jsonb, false, true),
('Plano Exclusivo', 0.00, 'Solução personalizada com valor sob orçamento', -1, 0, '["Solução personalizada", "Funcionalidades exclusivas", "Usuários ilimitados", "Suporte dedicado", "Treinamento incluso", "Customizações", "SLA garantido"]'::jsonb, true, true);