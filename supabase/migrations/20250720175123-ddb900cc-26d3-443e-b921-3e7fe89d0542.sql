-- Inserir integrações Shopee e Amazon na tabela integrations_available

INSERT INTO public.integrations_available (
  id,
  name,
  type,
  description,
  logo_url,
  visible_to_companies,
  is_global_only,
  available_for_plans,
  config_schema,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Shopee',
  'marketplace',
  'Integração com marketplace Shopee para sincronização de produtos, pedidos e estoque',
  'https://img.icons8.com/color/96/shopee.png',
  true,
  false,
  ARRAY['Starter', 'Professional', 'Enterprise'],
  '[
    {
      "field": "api_key",
      "label": "API Key",
      "type": "password",
      "required": true,
      "description": "Sua chave de API do Shopee Partner"
    },
    {
      "field": "secret_key", 
      "label": "Secret Key",
      "type": "password",
      "required": true,
      "description": "Sua chave secreta do Shopee Partner"
    },
    {
      "field": "shop_id",
      "label": "Shop ID",
      "type": "text",
      "required": true,
      "description": "ID da sua loja no Shopee"
    },
    {
      "field": "environment",
      "label": "Ambiente",
      "type": "select",
      "required": true,
      "options": [
        {"value": "sandbox", "label": "Sandbox (Testes)"},
        {"value": "production", "label": "Produção"}
      ],
      "default": "sandbox",
      "description": "Ambiente da API (sandbox para testes, production para uso real)"
    },
    {
      "field": "sync_products",
      "label": "Sincronizar Produtos",
      "type": "boolean",
      "default": true,
      "description": "Sincronizar produtos automaticamente"
    },
    {
      "field": "sync_orders",
      "label": "Sincronizar Pedidos",
      "type": "boolean", 
      "default": true,
      "description": "Sincronizar pedidos automaticamente"
    },
    {
      "field": "sync_inventory",
      "label": "Sincronizar Estoque",
      "type": "boolean",
      "default": true,
      "description": "Sincronizar estoque automaticamente"
    },
    {
      "field": "webhook_url",
      "label": "URL do Webhook",
      "type": "text",
      "required": false,
      "description": "URL para receber notificações do Shopee"
    }
  ]'::jsonb,
  now(),
  now()
), (
  gen_random_uuid(),
  'Amazon',
  'marketplace',
  'Integração com marketplace Amazon para sincronização de produtos, pedidos e estoque',
  'https://img.icons8.com/color/96/amazon.png',
  true,
  false,
  ARRAY['Professional', 'Enterprise'],
  '[
    {
      "field": "access_key_id",
      "label": "Access Key ID",
      "type": "password",
      "required": true,
      "description": "Sua Access Key ID da Amazon MWS/SP-API"
    },
    {
      "field": "secret_access_key",
      "label": "Secret Access Key", 
      "type": "password",
      "required": true,
      "description": "Sua Secret Access Key da Amazon MWS/SP-API"
    },
    {
      "field": "marketplace_id",
      "label": "Marketplace ID",
      "type": "select",
      "required": true,
      "options": [
        {"value": "ATVPDKIKX0DER", "label": "Amazon.com (US)"},
        {"value": "A2Q3Y263D00KWC", "label": "Amazon.com.br (Brasil)"},
        {"value": "A1AM78C64UM0Y8", "label": "Amazon.com.mx (México)"},
        {"value": "A2VIGQ35RCS4UG", "label": "Amazon.ae (UAE)"},
        {"value": "A1PA6795UKMFR9", "label": "Amazon.de (Alemanha)"},
        {"value": "A13V1IB3VIYZZH", "label": "Amazon.fr (França)"},
        {"value": "APJ6JRA9NG5V4", "label": "Amazon.it (Itália)"},
        {"value": "A1RKKUPIHCS9HS", "label": "Amazon.es (Espanha)"},
        {"value": "A1F83G8C2ARO7P", "label": "Amazon.co.uk (Reino Unido)"}
      ],
      "default": "A2Q3Y263D00KWC",
      "description": "Selecione o marketplace da Amazon"
    },
    {
      "field": "seller_id",
      "label": "Seller ID",
      "type": "text",
      "required": true,
      "description": "Seu ID de vendedor na Amazon"
    },
    {
      "field": "environment",
      "label": "Ambiente",
      "type": "select",
      "required": true,
      "options": [
        {"value": "sandbox", "label": "Sandbox (Testes)"},
        {"value": "production", "label": "Produção"}
      ],
      "default": "sandbox",
      "description": "Ambiente da API (sandbox para testes, production para uso real)"
    },
    {
      "field": "sync_products",
      "label": "Sincronizar Produtos",
      "type": "boolean",
      "default": true,
      "description": "Sincronizar produtos automaticamente"
    },
    {
      "field": "sync_orders",
      "label": "Sincronizar Pedidos",
      "type": "boolean",
      "default": true,
      "description": "Sincronizar pedidos automaticamente"
    },
    {
      "field": "sync_inventory",
      "label": "Sincronizar Estoque",
      "type": "boolean",
      "default": true,
      "description": "Sincronizar estoque automaticamente"
    },
    {
      "field": "fulfillment_center_id",
      "label": "Fulfillment Center ID",
      "type": "text",
      "required": false,
      "description": "ID do centro de distribuição (opcional)"
    }
  ]'::jsonb,
  now(),
  now()
);