-- Criar tabelas para módulo financeiro completo

-- Tabela de contas bancárias
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'corrente', -- corrente, poupanca, carteira, digital
  agency TEXT,
  account_number TEXT NOT NULL,
  initial_balance NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de categorias financeiras
CREATE TABLE public.financial_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- income, expense
  parent_id UUID REFERENCES public.financial_categories(id),
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de centros de custo
CREATE TABLE public.cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de transações financeiras (lançamentos)
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  type TEXT NOT NULL, -- income, expense, transfer
  category_id UUID REFERENCES public.financial_categories(id),
  cost_center_id UUID REFERENCES public.cost_centers(id),
  bank_account_id UUID REFERENCES public.bank_accounts(id),
  customer_id UUID REFERENCES public.customers(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_date DATE NOT NULL,
  due_date DATE,
  payment_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  payment_method TEXT, -- pix, boleto, card, cash, transfer
  reference_type TEXT, -- sale, purchase, manual
  reference_id UUID,
  notes TEXT,
  attachment_url TEXT,
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações financeiras
CREATE TABLE public.finance_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  default_currency TEXT NOT NULL DEFAULT 'BRL',
  allow_retroactive BOOLEAN NOT NULL DEFAULT true,
  auto_categorize BOOLEAN NOT NULL DEFAULT false,
  send_due_alerts BOOLEAN NOT NULL DEFAULT true,
  alert_days_before INTEGER NOT NULL DEFAULT 3,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para bank_accounts
CREATE POLICY "Company bank_accounts access" ON public.bank_accounts FOR SELECT USING (can_access_company_data(company_id));
CREATE POLICY "Company bank_accounts management" ON public.bank_accounts FOR INSERT WITH CHECK (can_access_company_data(company_id) AND has_specific_permission('financeiro', company_id));
CREATE POLICY "Company bank_accounts update" ON public.bank_accounts FOR UPDATE USING (can_access_company_data(company_id) AND has_specific_permission('financeiro', company_id));
CREATE POLICY "Company bank_accounts delete" ON public.bank_accounts FOR DELETE USING (can_manage_company_data(company_id));

-- Políticas RLS para financial_categories
CREATE POLICY "Company financial_categories access" ON public.financial_categories FOR SELECT USING (can_access_company_data(company_id));
CREATE POLICY "Company financial_categories management" ON public.financial_categories FOR INSERT WITH CHECK (can_access_company_data(company_id) AND has_specific_permission('financeiro', company_id));
CREATE POLICY "Company financial_categories update" ON public.financial_categories FOR UPDATE USING (can_access_company_data(company_id) AND has_specific_permission('financeiro', company_id));
CREATE POLICY "Company financial_categories delete" ON public.financial_categories FOR DELETE USING (can_manage_company_data(company_id));

-- Políticas RLS para cost_centers
CREATE POLICY "Company cost_centers access" ON public.cost_centers FOR SELECT USING (can_access_company_data(company_id));
CREATE POLICY "Company cost_centers management" ON public.cost_centers FOR INSERT WITH CHECK (can_access_company_data(company_id) AND has_specific_permission('financeiro', company_id));
CREATE POLICY "Company cost_centers update" ON public.cost_centers FOR UPDATE USING (can_access_company_data(company_id) AND has_specific_permission('financeiro', company_id));
CREATE POLICY "Company cost_centers delete" ON public.cost_centers FOR DELETE USING (can_manage_company_data(company_id));

-- Políticas RLS para financial_transactions
CREATE POLICY "Company financial_transactions access" ON public.financial_transactions FOR SELECT USING (can_access_company_data(company_id));
CREATE POLICY "Company financial_transactions management" ON public.financial_transactions FOR INSERT WITH CHECK (can_access_company_data(company_id) AND has_specific_permission('financeiro', company_id));
CREATE POLICY "Company financial_transactions update" ON public.financial_transactions FOR UPDATE USING (can_access_company_data(company_id) AND has_specific_permission('financeiro', company_id));
CREATE POLICY "Company financial_transactions delete" ON public.financial_transactions FOR DELETE USING (can_manage_company_data(company_id));

-- Políticas RLS para finance_settings
CREATE POLICY "Company finance_settings access" ON public.finance_settings FOR SELECT USING (can_access_company_data(company_id));
CREATE POLICY "Company finance_settings management" ON public.finance_settings FOR INSERT WITH CHECK (can_manage_company_data(company_id));
CREATE POLICY "Company finance_settings update" ON public.finance_settings FOR UPDATE USING (can_manage_company_data(company_id));

-- Triggers para updated_at
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_financial_categories_updated_at BEFORE UPDATE ON public.financial_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cost_centers_updated_at BEFORE UPDATE ON public.cost_centers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_settings_updated_at BEFORE UPDATE ON public.finance_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_bank_accounts_company_id ON public.bank_accounts(company_id);
CREATE INDEX idx_financial_categories_company_id ON public.financial_categories(company_id);
CREATE INDEX idx_cost_centers_company_id ON public.cost_centers(company_id);
CREATE INDEX idx_financial_transactions_company_id ON public.financial_transactions(company_id);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX idx_finance_settings_company_id ON public.finance_settings(company_id);

-- Inserir categorias padrão
INSERT INTO public.financial_categories (company_id, name, type) VALUES 
  (get_default_company_id(), 'Vendas', 'income'),
  (get_default_company_id(), 'Serviços', 'income'),
  (get_default_company_id(), 'Aluguel', 'expense'),
  (get_default_company_id(), 'Salários', 'expense'),
  (get_default_company_id(), 'Impostos', 'expense'),
  (get_default_company_id(), 'Fornecedores', 'expense'),
  (get_default_company_id(), 'Marketing', 'expense'),
  (get_default_company_id(), 'Outros', 'expense');

-- Inserir centro de custo padrão
INSERT INTO public.cost_centers (company_id, name, description) VALUES 
  (get_default_company_id(), 'Comercial', 'Área comercial e vendas'),
  (get_default_company_id(), 'Administrativo', 'Área administrativa'),
  (get_default_company_id(), 'Produção', 'Área de produção'),
  (get_default_company_id(), 'Marketing', 'Área de marketing');