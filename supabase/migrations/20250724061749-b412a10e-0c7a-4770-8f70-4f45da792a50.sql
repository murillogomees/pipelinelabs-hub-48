-- Remover completamente todas as tabelas relacionadas ao marketplace
-- Drop tabelas na ordem correta (considerando foreign keys)

-- 1. Tabelas dependentes primeiro
DROP TABLE IF EXISTS public.marketplace_product_mappings CASCADE;
DROP TABLE IF EXISTS public.marketplace_sync_logs CASCADE;
DROP TABLE IF EXISTS public.company_marketplace_configs CASCADE;

-- 2. Tabela principal de integrações
DROP TABLE IF EXISTS public.marketplace_integrations CASCADE;

-- 3. Tabela de canais
DROP TABLE IF EXISTS public.marketplace_channels CASCADE;

-- 4. Remover funções relacionadas ao marketplace
DROP FUNCTION IF EXISTS public.process_oauth_callback(uuid, text, text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.log_marketplace_sync(uuid, text, text, text, text, integer, integer, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.encrypt_marketplace_credentials(uuid, jsonb, text) CASCADE;
DROP FUNCTION IF EXISTS public.decrypt_marketplace_credentials(uuid, text) CASCADE;

-- 5. Limpar referências ao marketplace em outras tabelas
-- Atualizar tipos de integração para remover marketplace
DO $$
BEGIN
  -- Verificar se existe a constraint e removê-la se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%type%' 
    AND table_name = 'integrations_available'
  ) THEN
    ALTER TABLE public.integrations_available DROP CONSTRAINT IF EXISTS integrations_available_type_check;
  END IF;
  
  -- Remover integrações do tipo marketplace
  DELETE FROM public.integrations_available WHERE type = 'marketplace';
  
  -- Recriar constraint sem marketplace
  ALTER TABLE public.integrations_available 
  ADD CONSTRAINT integrations_available_type_check 
  CHECK (type IN ('logistica', 'financeiro', 'api', 'comunicacao', 'contabilidade', 'personalizada'));
END $$;