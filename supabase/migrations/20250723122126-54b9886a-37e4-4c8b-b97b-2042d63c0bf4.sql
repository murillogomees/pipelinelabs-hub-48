-- Atualizar configuração da landing page para usar logo interno
UPDATE public.landing_page_config 
SET logo_url = '/favicon.png'
WHERE logo_url IS NULL OR logo_url = '';

-- Garantir que existe uma configuração padrão
INSERT INTO public.landing_page_config (
  config_name, 
  company_name, 
  logo_url,
  primary_color,
  secondary_color
) 
VALUES (
  'default', 
  'Pipeline Labs', 
  '/favicon.png',
  '#0f172a',
  '#64748b'
)
ON CONFLICT (config_name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url;