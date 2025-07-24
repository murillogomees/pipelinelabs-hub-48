-- Adicionar campos para OAuth e criptografia na tabela marketplace_integrations
ALTER TABLE public.marketplace_integrations 
ADD COLUMN IF NOT EXISTS oauth_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS encrypted_credentials TEXT,
ADD COLUMN IF NOT EXISTS webhook_id TEXT,
ADD COLUMN IF NOT EXISTS webhook_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_webhook_received TIMESTAMPTZ;

-- Criar função para criptografar credenciais
CREATE OR REPLACE FUNCTION public.encrypt_marketplace_credentials(
  p_integration_id UUID,
  p_credentials JSONB,
  p_encryption_key TEXT DEFAULT 'pipeline_labs_2024_key'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar com credenciais criptografadas
  UPDATE public.marketplace_integrations
  SET 
    encrypted_credentials = encode(
      encrypt(p_credentials::text::bytea, p_encryption_key, 'aes'), 
      'base64'
    ),
    credentials = '{}'::jsonb,
    updated_at = now()
  WHERE id = p_integration_id;
END;
$$;

-- Criar função para descriptografar credenciais (apenas para edge functions)
CREATE OR REPLACE FUNCTION public.decrypt_marketplace_credentials(
  p_integration_id UUID,
  p_encryption_key TEXT DEFAULT 'pipeline_labs_2024_key'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encrypted_data TEXT;
  decrypted_data TEXT;
BEGIN
  -- Buscar dados criptografados
  SELECT encrypted_credentials INTO encrypted_data
  FROM public.marketplace_integrations
  WHERE id = p_integration_id;
  
  IF encrypted_data IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;
  
  -- Descriptografar
  decrypted_data := convert_from(
    decrypt(decode(encrypted_data, 'base64'), p_encryption_key, 'aes'),
    'UTF8'
  );
  
  RETURN decrypted_data::jsonb;
END;
$$;

-- Função para criar webhook automaticamente
CREATE OR REPLACE FUNCTION public.create_marketplace_webhook(
  p_integration_id UUID,
  p_marketplace TEXT,
  p_webhook_url TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  webhook_id UUID := gen_random_uuid();
BEGIN
  -- Atualizar integração com webhook
  UPDATE public.marketplace_integrations
  SET 
    webhook_id = webhook_id::text,
    webhook_status = 'created',
    config = COALESCE(config, '{}'::jsonb) || jsonb_build_object(
      'webhook_url', p_webhook_url,
      'webhook_events', ARRAY['order.created', 'order.updated', 'product.created', 'product.updated']
    ),
    updated_at = now()
  WHERE id = p_integration_id;
  
  RETURN webhook_id;
END;
$$;

-- Função para processar OAuth callback
CREATE OR REPLACE FUNCTION public.process_oauth_callback(
  p_integration_id UUID,
  p_access_token TEXT,
  p_refresh_token TEXT DEFAULT NULL,
  p_expires_in INTEGER DEFAULT 3600
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.marketplace_integrations
  SET 
    oauth_token = p_access_token,
    refresh_token = p_refresh_token,
    token_expires_at = now() + (p_expires_in || ' seconds')::interval,
    status = 'active',
    updated_at = now()
  WHERE id = p_integration_id;
  
  RETURN FOUND;
END;
$$;

-- Trigger para auto-criptografar credenciais quando inseridas
CREATE OR REPLACE FUNCTION public.auto_encrypt_credentials()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se credenciais foram inseridas/atualizadas e não estão vazias
  IF NEW.credentials IS NOT NULL AND NEW.credentials != '{}'::jsonb THEN
    -- Criptografar automaticamente
    PERFORM encrypt_marketplace_credentials(NEW.id, NEW.credentials);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger
DROP TRIGGER IF EXISTS auto_encrypt_marketplace_credentials ON public.marketplace_integrations;
CREATE TRIGGER auto_encrypt_marketplace_credentials
  AFTER INSERT OR UPDATE ON public.marketplace_integrations
  FOR EACH ROW
  EXECUTE FUNCTION auto_encrypt_credentials();