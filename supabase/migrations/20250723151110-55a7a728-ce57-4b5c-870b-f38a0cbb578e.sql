-- Primeiro verificar se já existe configuração
DO $$
BEGIN
  -- Se não existe configuração, inserir uma
  IF NOT EXISTS (SELECT 1 FROM public.landing_page_config LIMIT 1) THEN
    INSERT INTO public.landing_page_config (
      config_name, 
      company_name, 
      logo_url,
      primary_color,
      secondary_color
    ) VALUES (
      'default', 
      'Pipeline Labs', 
      '/favicon.png',
      '#0f172a',
      '#64748b'
    );
  ELSE
    -- Se já existe, atualizar para usar logo interno
    UPDATE public.landing_page_config 
    SET logo_url = '/favicon.png'
    WHERE logo_url IS NULL OR logo_url = '' OR logo_url LIKE '%lovable%' OR logo_url LIKE '%placeholder%';
  END IF;
END $$;