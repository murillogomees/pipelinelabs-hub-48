-- Correção: Atualizar registros existentes antes de aplicar NOT NULL

-- 1. Atualizar registros com display_name null
UPDATE public.profiles 
SET display_name = COALESCE(email, 'Usuário') 
WHERE display_name IS NULL;

-- 2. Atualizar registros com email null (se houver)
UPDATE public.profiles 
SET email = 'no-email@pipeline.com' 
WHERE email IS NULL;

-- 3. Adicionar campos à tabela profiles (sem NOT NULL ainda)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS document TEXT,
ADD COLUMN IF NOT EXISTS document_type TEXT CHECK (document_type IN ('cpf', 'cnpj')),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS zipcode TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS person_type TEXT CHECK (person_type IN ('individual', 'company')) DEFAULT 'individual';

-- 4. Agora tornar campos obrigatórios NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN display_name SET NOT NULL,
ALTER COLUMN email SET NOT NULL;