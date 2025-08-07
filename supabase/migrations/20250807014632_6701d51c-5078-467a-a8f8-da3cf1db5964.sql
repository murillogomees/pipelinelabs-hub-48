-- Fix the user profile data with correct document type
UPDATE public.profiles 
SET document_type = 'cnpj'
WHERE user_id = 'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid 
  AND document = '01224117000111'
  AND document_type IS NULL;

-- If the profile doesn't exist yet, let's create it properly
DO $$
DECLARE
  operador_access_level_id UUID;
  user_company_id UUID;
BEGIN
  -- Get operador access level ID
  SELECT id INTO operador_access_level_id
  FROM public.access_levels
  WHERE name = 'operador'
  LIMIT 1;

  -- Create profile for the user if it doesn't exist with proper document_type
  INSERT INTO public.profiles (
    user_id,
    email,
    display_name,
    document,
    document_type,
    phone,
    access_level_id,
    is_active
  )
  SELECT 
    'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid,
    'murillogomes781@gmail.com',
    'Claudia Maria G Gomes',
    '01224117000111',
    'cnpj',
    '61983496459',
    operador_access_level_id,
    true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = 'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid
  );

  -- Get the user's company ID (should be the existing one)
  SELECT id INTO user_company_id
  FROM public.companies
  WHERE name = 'Fakezinhow#2752'
     OR document = '01224117000111'
  LIMIT 1;

  -- If no company exists, create one
  IF user_company_id IS NULL THEN
    INSERT INTO public.companies (
      name,
      document,
      email,
      user_id
    ) VALUES (
      'Fakezinhow#2752',
      '01224117000111',
      'murillogomes781@gmail.com',
      'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid
    ) RETURNING id INTO user_company_id;
  END IF;

  -- Create user_companies association if it doesn't exist
  INSERT INTO public.user_companies (
    user_id,
    company_id,
    role,
    is_active
  )
  SELECT
    'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid,
    user_company_id,
    'contratante',
    true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_companies 
    WHERE user_id = 'fd02ce89-3767-4a1d-aa03-44f8e1018477'::uuid
      AND company_id = user_company_id
  );

END $$;