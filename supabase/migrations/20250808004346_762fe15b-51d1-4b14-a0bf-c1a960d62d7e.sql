-- Create or replace function to handle new auth users and provision profile + company
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_display_name text;
  v_company_name text;
  v_document text;
  v_phone text;
  v_company_id uuid;
  v_profile_id uuid;
  v_exists boolean;
BEGIN
  -- Extract metadata safely
  v_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1));
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', v_display_name || ' - Empresa');
  v_document := COALESCE(NEW.raw_user_meta_data->>'document', 'TEMP-' || substr(NEW.id::text, 1, 8));
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NULL);

  -- Ensure profile exists or create it
  SELECT id INTO v_profile_id FROM public.profiles WHERE user_id = NEW.id LIMIT 1;
  IF v_profile_id IS NULL THEN
    INSERT INTO public.profiles (
      user_id, email, display_name, phone, document, is_active, created_at, updated_at
    ) VALUES (
      NEW.id, NEW.email, v_display_name, v_phone, v_document, true, now(), now()
    ) RETURNING id INTO v_profile_id;
  END IF;

  -- Ensure a company exists for the user (incubated company)
  SELECT c.id INTO v_company_id
  FROM public.companies c
  JOIN public.user_companies uc ON uc.company_id = c.id
  WHERE uc.user_id = NEW.id AND uc.is_active = true
  LIMIT 1;

  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (name, document, email, user_id, created_at, updated_at)
    VALUES (v_company_name, v_document, NEW.email, NEW.id, now(), now())
    RETURNING id INTO v_company_id;

    -- Link user to company with default role 'contratante'
    INSERT INTO public.user_companies (user_id, company_id, role, is_active)
    VALUES (NEW.id, v_company_id, 'contratante', true)
    ON CONFLICT (user_id, company_id) DO UPDATE SET is_active = true, role = EXCLUDED.role, updated_at = now();
  ELSE
    -- Ensure there is an active link
    INSERT INTO public.user_companies (user_id, company_id, role, is_active)
    VALUES (NEW.id, v_company_id, 'contratante', true)
    ON CONFLICT (user_id, company_id) DO UPDATE SET is_active = true, updated_at = now();
  END IF;

  -- Update profile with company reference if missing
  UPDATE public.profiles
  SET company_id = COALESCE(company_id, v_company_id), updated_at = now()
  WHERE id = v_profile_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Make sure signup is not blocked; log and proceed
  PERFORM public.log_security_event(
    'signup_provisioning_error',
    NEW.id,
    NULL,
    NULL,
    jsonb_build_object('error', SQLERRM, 'hint', 'handle_auth_user_created'),
    'high'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to run after a new auth user is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_created' AND n.nspname = 'auth' AND c.relname = 'users'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_created();
  END IF;
END$$;

-- Attach auto-assign basic plan after profile creation (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_assign_basic_plan'
  ) THEN
    CREATE TRIGGER trg_auto_assign_basic_plan
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.auto_assign_basic_plan();
  END IF;
END$$;

-- Helper function to repair provisioning for an existing user
CREATE OR REPLACE FUNCTION public.repair_user_provisioning(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  u record;
  result jsonb := '{}'::jsonb;
BEGIN
  SELECT id, email, raw_user_meta_data FROM auth.users WHERE id = p_user_id INTO u;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  PERFORM public.handle_auth_user_created() -- No direct call; simulate by inserting via logic below
  ;
  -- Reuse logic by performing upserts similar to trigger
  PERFORM 1;

  -- Build inputs
  PERFORM 1;
  -- Extract metadata
  -- Basic inline logic to ensure idempotency
  WITH meta AS (
    SELECT 
      COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)) AS display_name,
      COALESCE(u.raw_user_meta_data->>'company_name', COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)) || ' - Empresa') AS company_name,
      COALESCE(u.raw_user_meta_data->>'document', 'TEMP-' || substr(u.id::text, 1, 8)) AS document,
      u.raw_user_meta_data->>'phone' AS phone
  )
  -- Ensure profile
  INSERT INTO public.profiles (user_id, email, display_name, phone, document, is_active, created_at, updated_at)
  SELECT u.id, u.email, meta.display_name, meta.phone, meta.document, true, now(), now() FROM meta
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, display_name = EXCLUDED.display_name, phone = EXCLUDED.phone, document = EXCLUDED.document, updated_at = now();

  -- Ensure company and association
  , ins_company AS (
    INSERT INTO public.companies (name, document, email, user_id, created_at, updated_at)
    SELECT meta.company_name, meta.document, u.email, u.id, now(), now() FROM meta
    ON CONFLICT DO NOTHING
    RETURNING id
  )
  SELECT jsonb_build_object('success', true) INTO result;

  -- Link to company (find existing or the newly created)
  PERFORM 1;
  DECLARE v_company_id uuid;
  BEGIN
    SELECT c.id INTO v_company_id FROM public.companies c WHERE c.user_id = u.id ORDER BY created_at ASC LIMIT 1;
    IF v_company_id IS NULL THEN
      SELECT id INTO v_company_id FROM ins_company LIMIT 1;
    END IF;

    IF v_company_id IS NOT NULL THEN
      INSERT INTO public.user_companies (user_id, company_id, role, is_active)
      VALUES (u.id, v_company_id, 'contratante', true)
      ON CONFLICT (user_id, company_id) DO UPDATE SET is_active = true, updated_at = now();

      UPDATE public.profiles SET company_id = COALESCE(company_id, v_company_id), updated_at = now() WHERE user_id = u.id;
    END IF;
  END;

  RETURN jsonb_build_object('success', true, 'message', 'Provisioning repaired');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;