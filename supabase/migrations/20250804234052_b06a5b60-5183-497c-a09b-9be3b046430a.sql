-- Associar usuário atual a uma empresa
INSERT INTO public.user_companies (user_id, company_id, role, is_active)
SELECT 
  '9e13b8e0-e674-4413-a5dc-71a2396aa867' as user_id,
  '7f729891-d493-4c70-a08e-be54b569bc2a' as company_id,
  'contratante' as role,
  true as is_active
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_companies 
  WHERE user_id = '9e13b8e0-e674-4413-a5dc-71a2396aa867' 
  AND company_id = '7f729891-d493-4c70-a08e-be54b569bc2a'
);

-- Também garantir que há uma empresa padrão caso necessário
INSERT INTO public.companies (name, document, email)
SELECT 'Empresa Padrão', '00000000000191', 'contato@empresa.com'
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE document = '00000000000191');