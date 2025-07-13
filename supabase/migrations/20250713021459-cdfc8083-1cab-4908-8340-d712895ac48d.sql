-- Adicionar campos de integração na tabela company_settings
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT,
ADD COLUMN IF NOT EXISTS stripe_products JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS nfe_api_token TEXT,
ADD COLUMN IF NOT EXISTS nfe_environment TEXT DEFAULT 'dev',
ADD COLUMN IF NOT EXISTS nfe_cnpj TEXT;