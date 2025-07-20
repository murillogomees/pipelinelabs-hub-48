
-- Criar função para gerar números de assinatura
CREATE OR REPLACE FUNCTION public.generate_subscription_number(company_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  next_number INTEGER;
  company_prefix TEXT;
  current_year TEXT;
BEGIN
  -- Ano atual
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Buscar próximo número para a empresa no ano atual
  SELECT COALESCE(MAX(CAST(SUBSTRING(subscription_number FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.subscriptions
  WHERE company_id = company_uuid 
    AND subscription_number IS NOT NULL
    AND subscription_number LIKE '%' || current_year || '%';
  
  -- Usar prefixo da empresa ou SUB como padrão
  SELECT COALESCE(SUBSTRING(name FROM 1 FOR 3), 'SUB')
  INTO company_prefix
  FROM public.companies
  WHERE id = company_uuid;
  
  RETURN UPPER(company_prefix) || '-' || LPAD(next_number::TEXT, 4, '0') || '/' || current_year;
END;
$function$;

-- Adicionar coluna subscription_number na tabela subscriptions se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' 
                   AND column_name = 'subscription_number') THEN
        ALTER TABLE public.subscriptions ADD COLUMN subscription_number TEXT;
    END IF;
END $$;

-- Criar trigger para gerar número de assinatura automaticamente
CREATE OR REPLACE FUNCTION public.set_subscription_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.subscription_number IS NULL THEN
    NEW.subscription_number := generate_subscription_number(NEW.company_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_set_subscription_number ON public.subscriptions;
CREATE TRIGGER trigger_set_subscription_number
  BEFORE INSERT ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_subscription_number();

-- Inserir planos padrão se não existirem (atualizar os existentes)
INSERT INTO public.plans (name, price, description, user_limit, trial_days, features, is_custom, active) VALUES
('Starter', 0.00, 'Plano gratuito para começar', 1, 30, '["Dashboard básico", "Gestão de vendas básica", "Até 100 produtos", "1 usuário", "Suporte por email"]'::jsonb, false, true),
('Básico', 149.00, 'Ideal para pequenos negócios que estão começando', 3, 15, '["Dashboard completo", "Gestão de vendas", "Produtos ilimitados", "Controle de estoque básico", "Emissão de NFe", "Até 3 usuários", "Suporte por email"]'::jsonb, false, true),
('Profissional', 289.00, 'Para empresas em crescimento que precisam de mais funcionalidades', 10, 7, '["Tudo do Básico", "Gestão financeira avançada", "Relatórios detalhados", "Integrações", "PDV", "Até 10 usuários", "Suporte prioritário"]'::jsonb, false, true),
('Empresarial', 489.00, 'Solução completa para empresas consolidadas', 50, 0, '["Tudo do Profissional", "Dashboard executivo", "Gestão multicanal", "Automações avançadas", "API completa", "White label básico", "Até 50 usuários", "Suporte premium"]'::jsonb, false, true),
('Enterprise', 0.00, 'Solução personalizada com valor sob orçamento', -1, 0, '["Solução 100% personalizada", "Funcionalidades exclusivas", "Usuários ilimitados", "White label completo", "Suporte dedicado", "Treinamento incluso", "Customizações", "SLA garantido"]'::jsonb, true, true)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  user_limit = EXCLUDED.user_limit,
  trial_days = EXCLUDED.trial_days,
  features = EXCLUDED.features,
  is_custom = EXCLUDED.is_custom,
  active = EXCLUDED.active,
  updated_at = now();
