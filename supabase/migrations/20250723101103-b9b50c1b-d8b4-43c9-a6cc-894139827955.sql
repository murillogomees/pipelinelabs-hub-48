-- Criar índices para melhorar performance das consultas

-- Índices para billing_logs
CREATE INDEX IF NOT EXISTS idx_billing_logs_company_id ON public.billing_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_logs_subscription_id ON public.billing_logs(subscription_id);

-- Índices para company_integrations  
CREATE INDEX IF NOT EXISTS idx_company_integrations_company_id ON public.company_integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_integrations_integration_id ON public.company_integrations(integration_id);

-- Índices para financial_transactions
CREATE INDEX IF NOT EXISTS idx_financial_transactions_company_id ON public.financial_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_reference_id ON public.financial_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category_id ON public.financial_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_bank_account_id ON public.financial_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_customer_id ON public.financial_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_supplier_id ON public.financial_transactions(supplier_id);

-- Índices adicionais para consultas comuns
CREATE INDEX IF NOT EXISTS idx_financial_transactions_transaction_date ON public.financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_due_date ON public.financial_transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(type);

-- Índices compostos para consultas mais complexas
CREATE INDEX IF NOT EXISTS idx_financial_transactions_company_status ON public.financial_transactions(company_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_company_type ON public.financial_transactions(company_id, type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_company_date ON public.financial_transactions(company_id, transaction_date);