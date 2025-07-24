-- Fix missing RPC function and improve marketplace integration handling

-- Update the process_oauth_callback function to handle token storage properly
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

-- Add constraint to handle unique marketplace per company properly
-- First drop the existing constraint if it exists
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

-- Create index for better performance on marketplace integration queries
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_company_marketplace 
ON marketplace_integrations(company_id, marketplace, status);

-- Create index for token expiration monitoring
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_token_expires 
ON marketplace_integrations(token_expires_at) 
WHERE token_expires_at IS NOT NULL;

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens() RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE marketplace_integrations 
  SET 
    status = 'error',
    updated_at = NOW()
  WHERE 
    token_expires_at < NOW() 
    AND status = 'active'
    AND oauth_token IS NOT NULL;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;