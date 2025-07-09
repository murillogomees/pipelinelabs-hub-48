-- Create default company "Pipeline Labs"
INSERT INTO public.companies (
  id,
  name,
  document,
  email,
  phone,
  address,
  city,
  state,
  zipcode,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Pipeline Labs',
  '12.345.678/0001-90',
  'contato@pipelinelabs.com.br',
  '(11) 3456-7890',
  'Av. Paulista, 1000 - Sala 1001',
  'São Paulo',
  'SP',
  '01310-100',
  now(),
  now()
) ON CONFLICT (document) DO NOTHING;

-- Create a function to get the default company ID
CREATE OR REPLACE FUNCTION public.get_default_company_id()
RETURNS UUID AS $$
  SELECT id FROM public.companies WHERE name = 'Pipeline Labs' LIMIT 1;
$$ LANGUAGE SQL STABLE;