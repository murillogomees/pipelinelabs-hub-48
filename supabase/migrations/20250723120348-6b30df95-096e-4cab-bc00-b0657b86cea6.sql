-- Atualizar configurações da landing page para usar logo interno
UPDATE public.landing_page_settings 
SET setting_value = '/favicon.png'
WHERE setting_key = 'logo_url';

-- Se não existir o campo logo_url, criar ele
INSERT INTO public.landing_page_settings (setting_key, setting_value, setting_type) 
VALUES ('logo_url', '/favicon.png', 'image')
ON CONFLICT (setting_key) DO UPDATE SET
setting_value = EXCLUDED.setting_value;