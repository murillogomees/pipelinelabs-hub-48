-- Criar perfil para o super admin
INSERT INTO public.profiles (
  user_id,
  email,
  display_name,
  access_level_id,
  is_active
) VALUES (
  '9e13b8e0-e674-4413-a5dc-71a2396aa867',
  'murilloggomes@gmail.com',
  'Murillo Gomes - Super Admin',
  'c7d9a3c0-854d-49fa-8e99-d0e1b83f0a89',
  true
);

-- Criar associação com a empresa Pipeline Labs
INSERT INTO public.user_companies (
  user_id,
  company_id,
  role,
  is_active
) VALUES (
  '9e13b8e0-e674-4413-a5dc-71a2396aa867',
  '665bbc23-2cbc-4dfe-9a10-51327720042c',
  'super_admin',
  true
) ON CONFLICT (user_id, company_id) DO UPDATE SET
  role = 'super_admin',
  is_active = true;