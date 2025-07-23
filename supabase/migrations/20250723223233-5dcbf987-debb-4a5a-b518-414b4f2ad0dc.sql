-- Verifica se a tabela já existe antes de criar
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marketplace_integrations') THEN
    -- Criar tabela marketplace_integrations
    CREATE TABLE public.marketplace_integrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
      marketplace TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
      auth_type TEXT NOT NULL DEFAULT 'apikey' CHECK (auth_type IN ('oauth', 'apikey')),
      credentials JSONB NOT NULL DEFAULT '{}',
      config JSONB DEFAULT '{}',
      last_sync TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;

    -- Políticas RLS
    CREATE POLICY "Users can view their company integrations" 
    ON public.marketplace_integrations 
    FOR SELECT 
    USING (can_access_company_data(company_id));

    CREATE POLICY "Users can create integrations for their company" 
    ON public.marketplace_integrations 
    FOR INSERT 
    WITH CHECK (can_access_company_data(company_id));

    CREATE POLICY "Users can update their company integrations" 
    ON public.marketplace_integrations 
    FOR UPDATE 
    USING (can_access_company_data(company_id));

    CREATE POLICY "Users can delete their company integrations" 
    ON public.marketplace_integrations 
    FOR DELETE 
    USING (can_access_company_data(company_id));

    -- Trigger para atualizar updated_at (apenas se a tabela foi criada)
    CREATE TRIGGER update_marketplace_integrations_updated_at
      BEFORE UPDATE ON public.marketplace_integrations
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;