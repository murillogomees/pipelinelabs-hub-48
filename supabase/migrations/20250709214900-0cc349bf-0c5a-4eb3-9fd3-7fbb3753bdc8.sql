-- Garantir que a empresa Pipeline Labs existe com dados completos
INSERT INTO public.companies (
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
) ON CONFLICT (document) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  zipcode = EXCLUDED.zipcode,
  updated_at = now();