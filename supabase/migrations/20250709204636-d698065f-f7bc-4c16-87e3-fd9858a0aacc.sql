-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seus próprios perfis
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Política para usuários atualizarem seus próprios perfis
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

-- Política para administradores verem todos os perfis
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_companies 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  )
);

-- Política para administradores gerenciarem todos os perfis
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_companies 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  )
);

-- Função para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar colunas úteis na tabela user_companies se necessário
ALTER TABLE public.user_companies 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;

-- Política para administradores gerenciarem user_companies
CREATE POLICY "Admins can manage user companies" 
ON public.user_companies 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_companies uc 
    WHERE uc.user_id = auth.uid() 
    AND uc.role = 'admin' 
    AND uc.is_active = true
  )
);

-- Permitir administradores inserir novos usuários em empresas
CREATE POLICY "Admins can insert user companies" 
ON public.user_companies 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_companies uc 
    WHERE uc.user_id = auth.uid() 
    AND uc.role = 'admin' 
    AND uc.is_active = true
  )
);