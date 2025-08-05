-- Function to handle new user signup and create profile + company association
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_document TEXT;
  user_company_name TEXT;
  user_display_name TEXT;
  user_phone TEXT;
  document_length INTEGER;
  access_level_id UUID;
  new_company_id UUID;
  company_exists BOOLEAN := FALSE;
BEGIN
  -- Extract metadata from auth.users
  user_document := NEW.raw_user_meta_data ->> 'document';
  user_company_name := NEW.raw_user_meta_data ->> 'company_name';
  user_display_name := NEW.raw_user_meta_data ->> 'display_name';
  user_phone := NEW.raw_user_meta_data ->> 'phone';
  
  -- Clean document (remove non-numeric characters)
  IF user_document IS NOT NULL THEN
    user_document := REGEXP_REPLACE(user_document, '[^0-9]', '', 'g');
  END IF;
  
  -- Determine document type and access level
  IF user_document IS NOT NULL THEN
    document_length := LENGTH(user_document);
    
    -- Get appropriate access level based on document type
    IF document_length = 11 THEN
      -- CPF = Operador
      SELECT id INTO access_level_id FROM public.access_levels WHERE name = 'operador' AND is_active = true LIMIT 1;
    ELSIF document_length = 14 THEN
      -- CNPJ = Contratante
      SELECT id INTO access_level_id FROM public.access_levels WHERE name = 'contratante' AND is_active = true LIMIT 1;
    END IF;
  END IF;
  
  -- If no specific access level found, default to operador
  IF access_level_id IS NULL THEN
    SELECT id INTO access_level_id FROM public.access_levels WHERE name = 'operador' AND is_active = true LIMIT 1;
  END IF;
  
  -- Handle company logic
  IF user_company_name IS NOT NULL AND user_company_name != '' THEN
    -- Check if company already exists by name
    SELECT EXISTS(
      SELECT 1 FROM public.companies WHERE LOWER(name) = LOWER(user_company_name)
    ) INTO company_exists;
    
    IF NOT company_exists THEN
      -- Create new company
      INSERT INTO public.companies (
        name,
        document,
        email,
        user_id
      ) VALUES (
        user_company_name,
        CASE WHEN document_length = 14 THEN user_document ELSE NULL END,
        NEW.email,
        NEW.id
      ) RETURNING id INTO new_company_id;
    ELSE
      -- Get existing company
      SELECT id INTO new_company_id 
      FROM public.companies 
      WHERE LOWER(name) = LOWER(user_company_name) 
      LIMIT 1;
    END IF;
  ELSE
    -- No company provided, try to get default company or create a personal one
    SELECT id INTO new_company_id 
    FROM public.companies 
    WHERE name = 'Pipeline Labs' 
    LIMIT 1;
    
    -- If no default company, create a personal company for CNPJ users
    IF new_company_id IS NULL AND document_length = 14 THEN
      INSERT INTO public.companies (
        name,
        document,
        email,
        user_id
      ) VALUES (
        COALESCE(user_display_name, 'Empresa'),
        user_document,
        NEW.email,
        NEW.id
      ) RETURNING id INTO new_company_id;
    END IF;
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (
    user_id,
    display_name,
    email,
    phone,
    document,
    document_type,
    person_type,
    access_level_id,
    companie_id,
    is_active
  ) VALUES (
    NEW.id,
    user_display_name,
    NEW.email,
    user_phone,
    user_document,
    CASE 
      WHEN document_length = 11 THEN 'cpf'
      WHEN document_length = 14 THEN 'cnpj'
      ELSE NULL
    END,
    CASE 
      WHEN document_length = 11 THEN 'individual'
      WHEN document_length = 14 THEN 'company'
      ELSE 'individual'
    END,
    access_level_id,
    new_company_id,
    true
  );
  
  -- Create user-company relationship if company exists
  IF new_company_id IS NOT NULL THEN
    INSERT INTO public.user_companies (
      user_id,
      company_id,
      role,
      is_active
    ) VALUES (
      NEW.id,
      new_company_id,
      CASE 
        WHEN document_length = 11 THEN 'operador'
        WHEN document_length = 14 THEN 'contratante'
        ELSE 'operador'
      END,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically handle new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();