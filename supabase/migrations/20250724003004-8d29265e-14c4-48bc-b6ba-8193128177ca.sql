-- Inserir marketplaces padrão
INSERT INTO public.marketplace_channels (name, display_name, description, logo_url, status, config_schema, oauth_config, required_plan_features) VALUES
('mercadolivre', 'Mercado Livre', 'Marketplace líder na América Latina', '/marketplace-logos/mercadolivre.png', 'active', 
 '{"fields": [{"name": "client_id", "label": "Client ID", "type": "text", "required": true}, {"name": "client_secret", "label": "Client Secret", "type": "password", "required": true}, {"name": "environment", "label": "Ambiente", "type": "select", "options": ["sandbox", "production"], "default": "sandbox"}]}',
 '{"auth_url": "https://auth.mercadolibre.com.ar/authorization", "token_url": "https://api.mercadolibre.com/oauth/token", "scopes": ["read", "write"]}',
 '["marketplace_integrations"]'),

('shopee', 'Shopee', 'Marketplace asiático em crescimento no Brasil', '/marketplace-logos/shopee.png', 'active',
 '{"fields": [{"name": "partner_id", "label": "Partner ID", "type": "text", "required": true}, {"name": "partner_key", "label": "Partner Key", "type": "password", "required": true}, {"name": "shop_id", "label": "Shop ID", "type": "text", "required": true}]}',
 '{}',
 '["marketplace_integrations"]'),

('amazon', 'Amazon', 'Marketplace global da Amazon', '/marketplace-logos/amazon.png', 'active',
 '{"fields": [{"name": "marketplace_id", "label": "Marketplace ID", "type": "text", "required": true}, {"name": "seller_id", "label": "Seller ID", "type": "text", "required": true}, {"name": "access_key", "label": "Access Key", "type": "text", "required": true}, {"name": "secret_key", "label": "Secret Key", "type": "password", "required": true}]}',
 '{}',
 '["marketplace_integrations", "premium_features"]'),

('magalu', 'Magazine Luiza', 'Marketplace do Magazine Luiza', '/marketplace-logos/magalu.png', 'active',
 '{"fields": [{"name": "client_id", "label": "Client ID", "type": "text", "required": true}, {"name": "client_secret", "label": "Client Secret", "type": "password", "required": true}, {"name": "tenant_id", "label": "Tenant ID", "type": "text", "required": true}]}',
 '{"auth_url": "https://oauth.magazineluiza.com/oauth/authorize", "token_url": "https://oauth.magazineluiza.com/oauth/token"}',
 '["marketplace_integrations"]'),

('casasbahia', 'Casas Bahia', 'Marketplace das Casas Bahia (Via Varejo)', '/marketplace-logos/casasbahia.png', 'maintenance',
 '{"fields": [{"name": "api_key", "label": "API Key", "type": "password", "required": true}, {"name": "seller_code", "label": "Código do Vendedor", "type": "text", "required": true}]}',
 '{}',
 '["marketplace_integrations", "premium_features"]');