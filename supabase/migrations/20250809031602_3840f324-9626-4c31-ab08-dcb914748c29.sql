-- Promote specific user to super admin and ensure company association
BEGIN;
DO $$
DECLARE
  uid uuid;
  cid uuid;
  has_is_admin boolean;
  profiles_table_exists boolean;
BEGIN
  -- Find user by email
  SELECT id INTO uid FROM auth.users WHERE email = 'murilloggomes@gmail.com' LIMIT 1;
  IF uid IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', 'murilloggomes@gmail.com';
  END IF;

  -- Optionally flag as admin in profiles if available
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO profiles_table_exists;

  IF profiles_table_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_admin'
    ) INTO has_is_admin;

    IF has_is_admin THEN
      UPDATE public.profiles SET is_admin = true WHERE user_id = uid;
    END IF;
  END IF;

  -- Try to use an existing company association
  SELECT company_id INTO cid
  FROM public.user_companies
  WHERE user_id = uid
  ORDER BY is_active DESC
  LIMIT 1;

  -- Fallback to any existing company
  IF cid IS NULL THEN
    SELECT id INTO cid FROM public.companies ORDER BY created_at ASC LIMIT 1;
  END IF;

  -- If still no company, create one for the user
  IF cid IS NULL THEN
    INSERT INTO public.companies (name, document, email, user_id)
    VALUES ('Empresa do Murillo', '00000000000000', 'murilloggomes@gmail.com', uid)
    RETURNING id INTO cid;
  END IF;

  -- Ensure user is super_admin for that company
  IF EXISTS (SELECT 1 FROM public.user_companies WHERE user_id = uid AND company_id = cid) THEN
    UPDATE public.user_companies
    SET role = 'super_admin', is_active = true
    WHERE user_id = uid AND company_id = cid;
  ELSE
    INSERT INTO public.user_companies (user_id, company_id, role, is_active)
    VALUES (uid, cid, 'super_admin', true);
  END IF;
END $$;
COMMIT;