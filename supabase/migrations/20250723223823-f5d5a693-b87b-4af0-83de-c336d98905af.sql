-- Permitir company_id NULL para integrações de admin
ALTER TABLE public.marketplace_integrations 
ALTER COLUMN company_id DROP NOT NULL;