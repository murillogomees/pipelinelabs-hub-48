-- FASE 1: Correções Críticas da Estrutura do Banco

-- 1. Corrigir nome da coluna companie_id para company_id na tabela profiles
ALTER TABLE public.profiles RENAME COLUMN companie_id TO company_id;

-- 2. Adicionar foreign key constraint entre profiles e access_levels
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_access_level 
FOREIGN KEY (access_level_id) REFERENCES public.access_levels(id);

-- 3. Adicionar foreign key constraint entre profiles e companies  
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_company 
FOREIGN KEY (company_id) REFERENCES public.companies(id);

-- 4. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_access_level_id ON public.profiles(access_level_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- 5. Criar trigger para updated_at automático na tabela profiles
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON public.profiles;
CREATE TRIGGER update_profiles_updated_at_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- 6. Atualizar access_levels para garantir que permissions seja consistente
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