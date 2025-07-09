-- Criar o usuário admin padrão para murilloggomes@gmail.com
-- Primeiro criar o perfil
INSERT INTO public.profiles (
  user_id,
  display_name,
  email,
  phone,
  is_active
) VALUES (
  '9e13b8e0-e674-4413-a5dc-71a2396aa867', -- ID do usuário atual baseado no JWT
  'Murillo Gomes',
  'murilloggomes@gmail.com',
  '(61) 99697-5924',
  true
) ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active;

-- Criar associação admin com a empresa padrão
INSERT INTO public.user_companies (
  user_id,
  company_id,
  role,
  permissions,
  is_active
) VALUES (
  '9e13b8e0-e674-4413-a5dc-71a2396aa867',
  public.get_default_company_id(),
  'admin',
  '{"dashboard": true, "vendas": true, "produtos": true, "clientes": true, "financeiro": true, "notas_fiscais": true, "producao": true, "admin": true}',
  true
) ON CONFLICT (user_id, company_id) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active;