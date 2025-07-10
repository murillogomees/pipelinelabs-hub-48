
-- Create table for available integrations (managed by admin)
CREATE TABLE public.integrations_available (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('marketplace', 'logistica', 'financeiro', 'api', 'comunicacao', 'contabilidade', 'personalizada')),
  description text,
  logo_url text,
  config_schema jsonb DEFAULT '[]'::jsonb, -- Dynamic field definitions
  available_for_plans text[] DEFAULT ARRAY[]::text[],
  visible_to_companies boolean DEFAULT false,
  is_global_only boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on integrations_available
ALTER TABLE public.integrations_available ENABLE ROW LEVEL SECURITY;

-- Create policies for integrations_available
CREATE POLICY "Admins can manage all integrations_available"
ON public.integrations_available FOR ALL
TO authenticated
USING (is_current_user_admin());

CREATE POLICY "Companies can view available integrations"
ON public.integrations_available FOR SELECT
TO authenticated
USING (visible_to_companies = true);

-- Update integrations table to reference available integrations
ALTER TABLE public.integrations ADD COLUMN integration_available_id uuid REFERENCES public.integrations_available(id);

-- Create function to encrypt sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_integration_data(data jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple base64 encoding for demo - in production use pgcrypto
  RETURN encode(convert_to(data::text, 'UTF8'), 'base64');
END;
$$;

-- Create function to decrypt sensitive data
CREATE OR REPLACE FUNCTION public.decrypt_integration_data(encrypted_data text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple base64 decoding for demo - in production use pgcrypto
  RETURN convert_from(decode(encrypted_data, 'base64'), 'UTF8')::jsonb;
EXCEPTION
  WHEN OTHERS THEN
    RETURN '{}'::jsonb;
END;
$$;

-- Add trigger for updated_at on integrations_available
CREATE TRIGGER update_integrations_available_updated_at
BEFORE UPDATE ON public.integrations_available
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample integrations for demonstration
INSERT INTO public.integrations_available (name, type, description, config_schema, visible_to_companies) VALUES
('Mercado Livre', 'marketplace', 'Integração com Mercado Livre para vendas online', '[
  {"field": "client_id", "type": "text", "label": "Client ID", "required": true},
  {"field": "client_secret", "type": "password", "label": "Client Secret", "required": true},
  {"field": "user_id", "type": "text", "label": "User ID", "required": true}
]'::jsonb, true),
('Melhor Envio', 'logistica', 'Integração com Melhor Envio para gestão de entregas', '[
  {"field": "api_token", "type": "password", "label": "Token da API", "required": true},
  {"field": "sandbox", "type": "boolean", "label": "Modo Sandbox", "required": false}
]'::jsonb, true),
('WhatsApp Business', 'comunicacao', 'Integração com WhatsApp Business API', '[
  {"field": "phone_number_id", "type": "text", "label": "Phone Number ID", "required": true},
  {"field": "access_token", "type": "password", "label": "Access Token", "required": true},
  {"field": "verify_token", "type": "password", "label": "Verify Token", "required": true}
]'::jsonb, true);
