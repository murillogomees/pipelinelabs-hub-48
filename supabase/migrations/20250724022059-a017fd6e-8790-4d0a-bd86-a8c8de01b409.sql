-- Create RPC function for marketplace webhook creation
CREATE OR REPLACE FUNCTION create_marketplace_webhook(
  p_integration_id UUID,
  p_marketplace TEXT,
  p_webhook_url TEXT
) RETURNS UUID AS $$
DECLARE
  webhook_id UUID;
BEGIN
  -- Generate a UUID for the webhook
  webhook_id := gen_random_uuid();
  
  -- Update the marketplace integration with webhook info
  UPDATE marketplace_integrations 
  SET 
    webhook_url = p_webhook_url,
    webhook_status = 'active',
    updated_at = now()
  WHERE id = p_integration_id;
  
  -- Return the webhook ID
  RETURN webhook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;