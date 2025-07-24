-- Fix function conflicts and improve marketplace integration handling

-- Drop and recreate the process_oauth_callback function
DROP FUNCTION IF EXISTS process_oauth_callback(UUID, TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION process_oauth_callback(
  p_integration_id UUID,
  p_access_token TEXT,
  p_refresh_token TEXT DEFAULT NULL,
  p_expires_in INTEGER DEFAULT 3600
) RETURNS VOID AS $$
DECLARE
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate expiration time
  expires_at := NOW() + (p_expires_in || ' seconds')::INTERVAL;
  
  -- Update integration with OAuth tokens
  UPDATE marketplace_integrations 
  SET 
    oauth_token = p_access_token,
    refresh_token = p_refresh_token,
    token_expires_at = expires_at,
    status = 'active',
    updated_at = NOW()
  WHERE id = p_integration_id;
  
  -- Verify update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Integration not found: %', p_integration_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix unique constraint
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_integrations_company_id_marketplace_key') THEN
    ALTER TABLE marketplace_integrations DROP CONSTRAINT marketplace_integrations_company_id_marketplace_key;
  END IF;
END $$;

-- Add the constraint back with proper naming
ALTER TABLE marketplace_integrations 
ADD CONSTRAINT marketplace_integrations_company_marketplace_unique 
UNIQUE (company_id, marketplace);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_company_marketplace 
ON marketplace_integrations(company_id, marketplace, status);

CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_token_expires 
ON marketplace_integrations(token_expires_at) 
WHERE token_expires_at IS NOT NULL;