-- Fix the missing setup for user floriculturadf200@gmail.com
-- This should have been created automatically by the signup trigger

-- First, get the basic access level
DO $$
DECLARE
  basic_access_level_id uuid;
  new_company_id uuid;
  user_uuid uuid := '0d875280-d468-47dd-aad2-59c452b1cf16';
BEGIN
  -- Get the basic access level
  SELECT id INTO basic_access_level_id 
  FROM public.access_levels 
  WHERE name = 'operador' OR name = 'basic' 
  LIMIT 1;
  
  -- If no access level exists, create one
  IF basic_access_level_id IS NULL THEN
    INSERT INTO public.access_levels (name, display_name, permissions)
    VALUES ('operador', 'Operador', '{"dashboard": true, "vendas": true}')
    RETURNING id INTO basic_access_level_id;
  END IF;
  
  -- Create the profile
  INSERT INTO public.profiles (
    user_id,
    email,
    display_name,
    access_level_id,
    document,
    is_active
  ) VALUES (
    user_uuid,
    'floriculturadf200@gmail.com',
    'floriculturadf200@gmail.com',
    basic_access_level_id,
    NULL,
    true
  ) ON CONFLICT (user_id) DO NOTHING;
  
  -- Create the company
  INSERT INTO public.companies (
    name,
    document,
    email,
    user_id
  ) VALUES (
    'Floricultura DF',
    '00000000000001',
    'floriculturadf200@gmail.com',
    user_uuid
  ) RETURNING id INTO new_company_id;
  
  -- Create the user_company association
  INSERT INTO public.user_companies (
    user_id,
    company_id,
    role,
    is_active
  ) VALUES (
    user_uuid,
    new_company_id,
    'contratante',
    true
  );
  
END $$;