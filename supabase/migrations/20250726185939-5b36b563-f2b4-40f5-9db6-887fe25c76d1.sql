
-- Criar tabela de níveis de acesso
CREATE TABLE public.access_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir níveis de acesso padrão
INSERT INTO public.access_levels (name, display_name, description, permissions, is_system) VALUES
('super_admin', 'Super Administrador', 'Acesso completo ao sistema', '{
  "dashboard": true,
  "vendas": true,
  "produtos": true,
  "clientes": true,
  "compras": true,
  "estoque": true,
  "financeiro": true,
  "notas_fiscais": true,
  "producao": true,
  "contratos": true,
  "relatorios": true,
  "analytics": true,
  "marketplace_canais": true,
  "integracoes": true,
  "configuracoes": true,
  "admin_panel": true,
  "user_management": true,
  "company_management": true,
  "system_settings": true
}', true),
('contratante', 'Contratante (Empresa)', 'Administrador da empresa', '{
  "dashboard": true,
  "vendas": true,
  "produtos": true,
  "clientes": true,
  "compras": true,
  "estoque": true,
  "financeiro": true,
  "notas_fiscais": true,
  "producao": true,
  "contratos": true,
  "relatorios": true,
  "analytics": true,
  "marketplace_canais": true,
  "integracoes": true,
  "configuracoes": true,
  "user_management": true
}', true),
('operador', 'Operador', 'Usuário final com acesso limitado', '{
  "dashboard": true,
  "vendas": true,
  "produtos": true,
  "clientes": true,
  "compras": true,
  "estoque": true,
  "producao": true,
  "relatorios": true
}', true);

-- Adicionar coluna access_level_id na tabela user_companies
ALTER TABLE public.user_companies 
ADD COLUMN access_level_id UUID REFERENCES public.access_levels(id);

-- Migrar dados existentes baseado no user_type
UPDATE public.user_companies 
SET access_level_id = (
  SELECT id FROM public.access_levels 
  WHERE name = CASE 
    WHEN user_companies.user_type = 'super_admin' THEN 'super_admin'
    WHEN user_companies.user_type = 'contratante' THEN 'contratante' 
    ELSE 'operador'
  END
);

-- Criar RLS para access_levels
ALTER TABLE public.access_levels ENABLE ROW LEVEL SECURITY;

-- Políticas para access_levels
CREATE POLICY "Super admins can manage access levels"
ON public.access_levels FOR ALL
TO authenticated
USING (is_super_admin());

CREATE POLICY "Everyone can view active access levels"
ON public.access_levels FOR SELECT
TO authenticated
USING (is_active = true);

-- Atualizar função is_super_admin para usar access_levels
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_companies uc
    JOIN public.access_levels al ON uc.access_level_id = al.id
    WHERE uc.user_id = current_user_id
      AND al.name = 'super_admin'
      AND uc.is_active = true
      AND al.is_active = true
  );
END;
$function$;

-- Atualizar função is_contratante para usar access_levels
CREATE OR REPLACE FUNCTION public.is_contratante(company_uuid uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid := (SELECT auth.uid());
BEGIN
  IF company_uuid IS NULL THEN
    RETURN EXISTS (
      SELECT 1 
      FROM public.user_companies uc
      JOIN public.access_levels al ON uc.access_level_id = al.id
      WHERE uc.user_id = current_user_id
        AND al.name IN ('contratante', 'super_admin')
        AND uc.is_active = true
        AND al.is_active = true
    );
  ELSE
    RETURN EXISTS (
      SELECT 1 
      FROM public.user_companies uc
      JOIN public.access_levels al ON uc.access_level_id = al.id
      WHERE uc.user_id = current_user_id
        AND uc.company_id = company_uuid
        AND al.name IN ('contratante', 'super_admin')
        AND uc.is_active = true
        AND al.is_active = true
    );
  END IF;
END;
$function$;

-- Garantir que murilloggomes@gmail.com seja super admin
DO $$
DECLARE
  user_uuid uuid;
  pipeline_company_id uuid;
  super_admin_level_id uuid;
BEGIN
  -- Buscar ID do usuário
  SELECT user_id INTO user_uuid
  FROM public.profiles
  WHERE email = 'murilloggomes@gmail.com'
  LIMIT 1;
  
  -- Buscar Pipeline Labs ou criar se não existir
  SELECT id INTO pipeline_company_id
  FROM public.companies
  WHERE name = 'Pipeline Labs'
  LIMIT 1;
  
  IF pipeline_company_id IS NULL THEN
    INSERT INTO public.companies (name, document, email)
    VALUES ('Pipeline Labs', '00000000000191', 'admin@pipelinelabs.app')
    RETURNING id INTO pipeline_company_id;
  END IF;
  
  -- Buscar nível de acesso super_admin
  SELECT id INTO super_admin_level_id
  FROM public.access_levels
  WHERE name = 'super_admin';
  
  -- Criar ou atualizar user_company
  IF user_uuid IS NOT NULL AND super_admin_level_id IS NOT NULL THEN
    INSERT INTO public.user_companies (
      user_id,
      company_id,
      user_type,
      access_level_id,
      is_active,
      permissions,
      specific_permissions
    ) VALUES (
      user_uuid,
      pipeline_company_id,
      'super_admin',
      super_admin_level_id,
      true,
      '{"admin_panel": true, "system_management": true}',
      '{"super_admin_access": true}'
    )
    ON CONFLICT (user_id, company_id) 
    DO UPDATE SET
      user_type = 'super_admin',
      access_level_id = super_admin_level_id,
      is_active = true,
      permissions = '{"admin_panel": true, "system_management": true}',
      specific_permissions = '{"super_admin_access": true}',
      updated_at = now();
  END IF;
END $$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_access_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_access_levels_updated_at
BEFORE UPDATE ON public.access_levels
FOR EACH ROW
EXECUTE PROCEDURE update_access_levels_updated_at();
