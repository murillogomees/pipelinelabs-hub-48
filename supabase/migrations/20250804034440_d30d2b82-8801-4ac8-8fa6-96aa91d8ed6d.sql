-- Corrigir a função setup_initial_super_admin para usar 'role' ao invés de 'user_type'
CREATE OR REPLACE FUNCTION public.setup_initial_super_admin(p_email text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  admin_user_id uuid;
  pipeline_company_id uuid;
BEGIN
  -- Get the user ID for the specified email
  SELECT user_id INTO admin_user_id
  FROM public.profiles
  WHERE email = p_email
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_email;
  END IF;
  
  -- Get Pipeline Labs company ID
  SELECT id INTO pipeline_company_id
  FROM public.companies
  WHERE name = 'Pipeline Labs'
  LIMIT 1;
  
  -- If Pipeline Labs doesn't exist, create it
  IF pipeline_company_id IS NULL THEN
    INSERT INTO public.companies (name, document, email)
    VALUES ('Pipeline Labs', '00000000000191', 'admin@pipelinelabs.app')
    RETURNING id INTO pipeline_company_id;
  END IF;
  
  -- Create or update user_companies record for super admin
  INSERT INTO public.user_companies (
    user_id,
    company_id,
    role,
    is_active
  ) VALUES (
    admin_user_id,
    pipeline_company_id,
    'super_admin',
    true
  )
  ON CONFLICT (user_id, company_id) 
  DO UPDATE SET
    role = 'super_admin',
    is_active = true,
    updated_at = now();
  
  -- Log the super admin setup
  PERFORM log_security_event(
    'super_admin_setup',
    admin_user_id,
    NULL,
    NULL,
    jsonb_build_object('email', p_email, 'company_id', pipeline_company_id),
    'medium'
  );
  
  RETURN admin_user_id;
END;
$function$;