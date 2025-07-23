-- Criar tabela de planos de cobrança
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT NOT NULL DEFAULT 'month', -- month, year
  max_users INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de assinaturas das empresas
CREATE TABLE IF NOT EXISTS public.company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  billing_plan_id UUID REFERENCES billing_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive', -- active, past_due, canceled, unpaid
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id)
);

-- Criar tabela de logs de cobrança
CREATE TABLE IF NOT EXISTS public.billing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES company_subscriptions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- payment_succeeded, payment_failed, subscription_updated, etc
  status TEXT NOT NULL, -- success, failed, pending
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'brl',
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  invoice_url TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de configurações Stripe (por empresa ou global)
CREATE TABLE IF NOT EXISTS public.stripe_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- NULL = configuração global
  stripe_publishable_key TEXT,
  stripe_secret_key_encrypted TEXT,
  stripe_webhook_secret_encrypted TEXT,
  default_currency TEXT DEFAULT 'brl',
  test_mode BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;

-- Policies para billing_plans
CREATE POLICY "Everyone can view active billing plans" ON public.billing_plans
  FOR SELECT USING (active = true);

CREATE POLICY "Super admins can manage billing plans" ON public.billing_plans
  FOR ALL USING (is_super_admin());

-- Policies para company_subscriptions
CREATE POLICY "Companies can view their own subscriptions" ON public.company_subscriptions
  FOR SELECT USING (can_access_company_data(company_id));

CREATE POLICY "Super admins can manage all subscriptions" ON public.company_subscriptions
  FOR ALL USING (is_super_admin());

CREATE POLICY "System can insert/update subscriptions" ON public.company_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update subscriptions" ON public.company_subscriptions
  FOR UPDATE USING (true);

-- Policies para billing_logs
CREATE POLICY "Companies can view their own billing logs" ON public.billing_logs
  FOR SELECT USING (can_access_company_data(company_id));

CREATE POLICY "Super admins can view all billing logs" ON public.billing_logs
  FOR SELECT USING (is_super_admin());

CREATE POLICY "System can insert billing logs" ON public.billing_logs
  FOR INSERT WITH CHECK (true);

-- Policies para stripe_config
CREATE POLICY "Super admins can manage stripe config" ON public.stripe_config
  FOR ALL USING (is_super_admin());

-- Adicionar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_billing_plans_updated_at
    BEFORE UPDATE ON public.billing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_subscriptions_updated_at
    BEFORE UPDATE ON public.company_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_config_updated_at
    BEFORE UPDATE ON public.stripe_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir planos padrão
INSERT INTO public.billing_plans (name, description, price, interval, max_users, features) VALUES
('Básico', 'Plano básico para pequenos negócios', 29.90, 'month', 3, '["Gestão de vendas", "Controle de estoque básico", "Emissão de NFCe"]'),
('Econômico', 'Plano intermediário com mais funcionalidades', 59.90, 'month', 10, '["Gestão de vendas", "Controle de estoque avançado", "Emissão de NFe/NFCe", "Relatórios básicos"]'),
('Completo', 'Plano completo para empresas em crescimento', 99.90, 'month', 25, '["Todas as funcionalidades", "Integrações com marketplaces", "Relatórios avançados", "Suporte prioritário"]'),
('Exclusivo', 'Plano premium com recursos ilimitados', 199.90, 'month', -1, '["Recursos ilimitados", "Whitelabel", "API personalizada", "Suporte dedicado", "Customizações"]')
ON CONFLICT DO NOTHING;