-- FASE 1: Correções Críticas - Limpar Dados Órfãos

-- 1. Opção 1: Definir company_id como NULL para perfis órfãos (mais seguro)
UPDATE public.profiles 
SET companie_id = NULL 
WHERE companie_id IN (
  '27986ce1-0799-4ad2-8a39-652efd78ff71',
  '52d055d5-fc99-4c1a-84b6-a026dffe3182', 
  '5dc4860a-88ef-4347-b99f-c4f4f0ebaefb',
  '860552cc-0cfa-4b16-9218-cfe2953667f0',
  'f13db2aa-ef74-4dde-9bf7-e935acd99abe',
  'f60e6b10-32ea-4d8a-b57f-ae328aeb1c38'
);

-- 2. Agora renomear a coluna companie_id para company_id
ALTER TABLE public.profiles RENAME COLUMN companie_id TO company_id;

-- 3. Adicionar foreign key constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_access_level 
FOREIGN KEY (access_level_id) REFERENCES public.access_levels(id);

-- Não adicionamos FK para company pois pode ser NULL

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