
-- Inserir NFE.io como integração disponível
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
  'NFE.io',
  'fiscal',
  'Integração com NFE.io para emissão automática de notas fiscais eletrônicas com certificados A1',
  'https://nfe.io/static/img/nfe-io-logo.svg',
  true,
  false,
  ARRAY['Básico', 'Professional', 'Enterprise'],
  '[
    {
      "field": "api_token",
      "label": "Token da API NFE.io",
      "type": "password",
      "required": true,
      "description": "Token de acesso à API da NFE.io obtido no painel administrativo",
      "admin_only": true
    },
    {
      "field": "environment",
      "label": "Ambiente",
      "type": "select",
      "required": true,
      "options": [
        {"value": "sandbox", "label": "Homologação"},
        {"value": "production", "label": "Produção"}
      ],
      "default": "sandbox",
      "description": "Ambiente de operação da API",
      "admin_only": true
    },
    {
      "field": "webhook_url",
      "label": "URL do Webhook",
      "type": "url",
      "required": false,
      "description": "URL para receber notificações de status das NFes",
      "admin_only": true
    },
    {
      "field": "timeout",
      "label": "Timeout (segundos)",
      "type": "number",
      "required": false,
      "default": 30,
      "description": "Tempo limite para requisições à API",
      "admin_only": true
    },
    {
      "field": "company_cnpj",
      "label": "CNPJ da Empresa",
      "type": "text",
      "required": true,
      "description": "CNPJ da empresa emissora das notas fiscais",
      "mask": "00.000.000/0000-00",
      "contractor_field": true
    },
    {
      "field": "certificate_file",
      "label": "Certificado A1 (.pfx/.p12)",
      "type": "file",
      "required": true,
      "accept": ".pfx,.p12",
      "description": "Arquivo do certificado digital A1",
      "contractor_field": true
    },
    {
      "field": "certificate_password",
      "label": "Senha do Certificado",
      "type": "password",
      "required": true,
      "description": "Senha do certificado digital A1",
      "contractor_field": true
    },
    {
      "field": "nfe_series",
      "label": "Série da NFe",
      "type": "text",
      "required": false,
      "default": "001",
      "description": "Série padrão para emissão das NFes",
      "contractor_field": true
    },
    {
      "field": "default_cfop",
      "label": "CFOP Padrão",
      "type": "text",
      "required": false,
      "description": "CFOP padrão para operações (ex: 5102)",
      "contractor_field": true
    },
    {
      "field": "auto_send",
      "label": "Envio Automático",
      "type": "boolean",
      "default": true,
      "description": "Enviar NFes automaticamente após emissão",
      "contractor_field": true
    },
    {
      "field": "email_notification",
      "label": "Notificação por E-mail",
      "type": "boolean",
      "default": true,
      "description": "Enviar NFe por e-mail para o cliente",
      "contractor_field": true
    }
  ]'::jsonb,
  now(),
  now()
);
