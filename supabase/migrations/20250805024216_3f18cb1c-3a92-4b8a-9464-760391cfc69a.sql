-- FASE 1: Finalizar - Normalizar permissões nos access_levels
UPDATE public.access_levels 
SET permissions = jsonb_build_object(
  'dashboard', CASE WHEN permissions->>'dashboard' = 'true' THEN true ELSE false END,
  'vendas', CASE WHEN permissions->>'vendas' = 'true' THEN true ELSE false END,
  'produtos', CASE WHEN permissions->>'produtos' = 'true' THEN true ELSE false END,
  'clientes', CASE WHEN permissions->>'clientes' = 'true' THEN true ELSE false END,
  'fornecedores', CASE WHEN permissions->>'fornecedores' = 'true' THEN true ELSE false END,
  'estoque', CASE WHEN permissions->>'estoque' = 'true' THEN true ELSE false END,
  'financeiro', CASE WHEN permissions->>'financeiro' = 'true' THEN true ELSE false END,
  'relatorios', CASE WHEN permissions->>'relatorios' = 'true' THEN true ELSE false END,
  'configuracoes', CASE WHEN permissions->>'configuracoes' = 'true' THEN true ELSE false END,
  'admin_panel', CASE WHEN permissions->>'admin_panel' = 'true' OR name = 'super_admin' THEN true ELSE false END,
  'notas_fiscais', CASE WHEN permissions->>'notas_fiscais' = 'true' THEN true ELSE false END,
  'contratos', CASE WHEN permissions->>'contratos' = 'true' THEN true ELSE false END,
  'producao', CASE WHEN permissions->>'producao' = 'true' THEN true ELSE false END,
  'compras', CASE WHEN permissions->>'compras' = 'true' THEN true ELSE false END,
  'integracoes', CASE WHEN permissions->>'integracoes' = 'true' THEN true ELSE false END,
  'analytics', CASE WHEN permissions->>'analytics' = 'true' THEN true ELSE false END,
  'marketplace_canais', CASE WHEN permissions->>'marketplace_canais' = 'true' THEN true ELSE false END,
  'usuarios', CASE WHEN name IN ('super_admin', 'contratante') THEN true ELSE false END,
  'empresas', CASE WHEN name IN ('super_admin', 'contratante') THEN true ELSE false END,
  'sistema', CASE WHEN name = 'super_admin' THEN true ELSE false END,
  'seguranca', CASE WHEN name = 'super_admin' THEN true ELSE false END,
  'planos', CASE WHEN name = 'super_admin' THEN true ELSE false END
);