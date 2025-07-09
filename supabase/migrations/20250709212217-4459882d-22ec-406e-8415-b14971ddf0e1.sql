-- Create default company "Pipeline Labs"
-- First check if it already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE name = 'Pipeline Labs') THEN
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
    );
  END IF;
END
$$;

-- Create a function to get the default company ID
CREATE OR REPLACE FUNCTION public.get_default_company_id()
RETURNS UUID AS $$
  SELECT id FROM public.companies WHERE name = 'Pipeline Labs' LIMIT 1;
$$ LANGUAGE SQL STABLE;