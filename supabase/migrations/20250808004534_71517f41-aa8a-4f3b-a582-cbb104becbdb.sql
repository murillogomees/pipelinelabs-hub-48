-- Ensure automatic provisioning on signup: profile + company + user_companies
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
BEGIN
  v_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1));
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', v_display_name || ' - Empresa');
  v_document := COALESCE(NEW.raw_user_meta_data->>'document', 'TEMP-' || substr(NEW.id::text, 1, 8));
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NULL);

  -- Create profile if missing
  SELECT id INTO v_profile_id FROM public.profiles WHERE user_id = NEW.id LIMIT 1;
  IF v_profile_id IS NULL THEN
    INSERT INTO public.profiles (user_id, email, display_name, phone, document, is_active, created_at, updated_at)
    VALUES (NEW.id, NEW.email, v_display_name, v_phone, v_document, true, now(), now())
    RETURNING id INTO v_profile_id;
  END IF;

  -- Find existing active company association
  SELECT c.id INTO v_company_id
  FROM public.companies c
  JOIN public.user_companies uc ON uc.company_id = c.id
  WHERE uc.user_id = NEW.id AND uc.is_active = true
  ORDER BY uc.updated_at DESC NULLS LAST, uc.created_at DESC NULLS LAST
  LIMIT 1;

  -- Create company if none
  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (name, document, email, user_id, created_at, updated_at)
    VALUES (v_company_name, v_document, NEW.email, NEW.id, now(), now())
    RETURNING id INTO v_company_id;
  END IF;

  -- Ensure association
  INSERT INTO public.user_companies (user_id, company_id, role, is_active)
  VALUES (NEW.id, v_company_id, 'contratante', true)
  ON CONFLICT (user_id, company_id) DO UPDATE SET is_active = true, role = EXCLUDED.role, updated_at = now();

  -- Ensure profile has company_id
  UPDATE public.profiles SET company_id = COALESCE(company_id, v_company_id), updated_at = now() WHERE user_id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
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

-- Create trigger on auth.users (idempotent)
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

-- Repair function to fix a specific user provisioning
CREATE OR REPLACE FUNCTION public.repair_user_provisioning(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  u_email text;
  u_meta jsonb;
  v_display_name text;
  v_company_name text;
  v_document text;
  v_phone text;
  v_company_id uuid;
  v_profile_id uuid;
BEGIN
  SELECT email, raw_user_meta_data INTO u_email, u_meta FROM auth.users WHERE id = p_user_id;
  IF u_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  v_display_name := COALESCE(u_meta->>'display_name', split_part(u_email, '@', 1));
  v_company_name := COALESCE(u_meta->>'company_name', v_display_name || ' - Empresa');
  v_document := COALESCE(u_meta->>'document', 'TEMP-' || substr(p_user_id::text, 1, 8));
  v_phone := COALESCE(u_meta->>'phone', NULL);

  -- Upsert profile
  INSERT INTO public.profiles (user_id, email, display_name, phone, document, is_active, created_at, updated_at)
  VALUES (p_user_id, u_email, v_display_name, v_phone, v_document, true, now(), now())
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, display_name = EXCLUDED.display_name, phone = EXCLUDED.phone, document = EXCLUDED.document, updated_at = now();

  -- Find or create company
  SELECT c.id INTO v_company_id
  FROM public.companies c
  JOIN public.user_companies uc ON uc.company_id = c.id
  WHERE uc.user_id = p_user_id AND uc.is_active = true
  ORDER BY uc.updated_at DESC NULLS LAST, uc.created_at DESC NULLS LAST
  LIMIT 1;

  IF v_company_id IS NULL THEN
    -- Try to find a company created by this user
    SELECT id INTO v_company_id FROM public.companies WHERE user_id = p_user_id ORDER BY created_at ASC LIMIT 1;
  END IF;

  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (name, document, email, user_id, created_at, updated_at)
    VALUES (v_company_name, v_document, u_email, p_user_id, now(), now())
    RETURNING id INTO v_company_id;
  END IF;

  -- Ensure association
  INSERT INTO public.user_companies (user_id, company_id, role, is_active)
  VALUES (p_user_id, v_company_id, 'contratante', true)
  ON CONFLICT (user_id, company_id) DO UPDATE SET is_active = true, updated_at = now();

  -- Ensure profile has company_id
  UPDATE public.profiles SET company_id = COALESCE(company_id, v_company_id), updated_at = now() WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'company_id', v_company_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Ensure auto-assign basic plan trigger exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_assign_basic_plan') THEN
    CREATE TRIGGER trg_auto_assign_basic_plan
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.auto_assign_basic_plan();
  END IF;
END$$;