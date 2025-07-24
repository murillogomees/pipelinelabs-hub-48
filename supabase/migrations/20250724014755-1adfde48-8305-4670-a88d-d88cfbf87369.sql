-- Insert sample marketplace channels data if they don't exist
INSERT INTO public.marketplace_channels (
  name,
  display_name,
  description,
  status,
  config_schema,
  oauth_config,
  required_plan_features
) VALUES
  (
    'mercadolivre',
    'Mercado Livre',
    'O maior marketplace da América Latina para expansão digital',
    'active',
    '{
      "credentials": [
        {"name": "client_id", "type": "text", "label": "Client ID", "required": true},
        {"name": "client_secret", "type": "password", "label": "Client Secret", "required": true},
        {"name": "access_token", "type": "password", "label": "Access Token", "required": false}
      ]
    }',
    '{
      "authorization_url": "https://auth.mercadolivre.com.br/authorization",
      "token_url": "https://api.mercadolibre.com/oauth/token",
      "scopes": ["read", "write"]
    }',
    '["marketplace_integration", "inventory_sync"]'
  ),
  (
    'shopee',
    'Shopee',
    'Marketplace líder no sudeste asiático e Brasil',
    'active',
    '{
      "credentials": [
        {"name": "partner_id", "type": "text", "label": "Partner ID", "required": true},
        {"name": "partner_key", "type": "password", "label": "Partner Key", "required": true},
        {"name": "shop_id", "type": "text", "label": "Shop ID", "required": false}
      ]
    }',
    '{}',
    '["marketplace_integration", "inventory_sync"]'
  ),
  (
    'amazon',
    'Amazon',
    'O maior marketplace mundial para vendas online',
    'active',
    '{
      "credentials": [
        {"name": "selling_partner_id", "type": "text", "label": "Selling Partner ID", "required": true},
        {"name": "refresh_token", "type": "password", "label": "Refresh Token", "required": true},
        {"name": "marketplace_id", "type": "text", "label": "Marketplace ID", "required": true}
      ]
    }',
    '{}',
    '["marketplace_integration", "inventory_sync", "premium_features"]'
  ),
  (
    'magalu',
    'Magazine Luiza',
    'Um dos maiores varejistas do Brasil',
    'active',
    '{
      "credentials": [
        {"name": "client_id", "type": "text", "label": "Client ID", "required": true},
        {"name": "client_secret", "type": "password", "label": "Client Secret", "required": true}
      ]
    }',
    '{}',
    '["marketplace_integration"]'
  ),
  (
    'casasbahia',
    'Casas Bahia',
    'Marketplace do Grupo Via Varejo',
    'active',
    '{
      "credentials": [
        {"name": "api_key", "type": "password", "label": "API Key", "required": true},
        {"name": "seller_id", "type": "text", "label": "Seller ID", "required": true}
      ]
    }',
    '{}',
    '["marketplace_integration"]'
  )
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  config_schema = EXCLUDED.config_schema,
  oauth_config = EXCLUDED.oauth_config,
  required_plan_features = EXCLUDED.required_plan_features,
  updated_at = now();