
-- Verificar se o usuário existe e criar/atualizar suas permissões de super_admin
DO $$
DECLARE
    user_uuid UUID;
    pipeline_company_id UUID;
BEGIN
    -- Buscar o UUID do usuário pelo email
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'murilloggomes@gmail.com';
    
    -- Se o usuário não existir, sair
    IF user_uuid IS NULL THEN
        RAISE NOTICE 'Usuário murilloggomes@gmail.com não encontrado';
        RETURN;
    END IF;
    
    -- Buscar ou criar a empresa Pipeline Labs
    SELECT id INTO pipeline_company_id 
    FROM companies 
    WHERE name = 'Pipeline Labs' 
    LIMIT 1;
    
    -- Se não encontrar Pipeline Labs, criar
    IF pipeline_company_id IS NULL THEN
        INSERT INTO companies (name, document, created_at, updated_at)
        VALUES ('Pipeline Labs', '00000000000191', now(), now())
        RETURNING id INTO pipeline_company_id;
    END IF;
    
    -- Garantir que existe um perfil para o usuário
    INSERT INTO profiles (user_id, display_name, email, is_active, created_at, updated_at)
    VALUES (user_uuid, 'Murillo Gomes', 'murilloggomes@gmail.com', true, now(), now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        display_name = COALESCE(profiles.display_name, 'Murillo Gomes'),
        email = 'murilloggomes@gmail.com',
        is_active = true,
        updated_at = now();
    
    -- Remover qualquer associação existente para evitar duplicatas
    DELETE FROM user_companies WHERE user_id = user_uuid;
    
    -- Criar nova associação como super_admin com permissões completas
    INSERT INTO user_companies (
        user_id, 
        company_id, 
        user_type, 
        role, 
        permissions, 
        specific_permissions,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        pipeline_company_id,
        'super_admin',
        'super_admin',
        jsonb_build_object(
            'super_admin', true,
            'full_access', true,
            'admin_panel', true,
            'user_management', true,
            'company_management', true,
            'system_settings', true,
            'dashboard', true,
            'vendas', true,
            'produtos', true,
            'clientes', true,
            'compras', true,
            'financeiro', true,
            'notas_fiscais', true,
            'producao', true,
            'contratos', true,
            'estoque', true,
            'relatorios', true,
            'analytics', true,
            'marketplace_canais', true,
            'integracoes', true,
            'configuracoes', true
        ),
        jsonb_build_object(
            'super_admin', true,
            'full_access', true,
            'admin_panel', true,
            'user_management', true,
            'company_management', true,
            'system_settings', true
        ),
        true,
        now(),
        now()
    );
    
    RAISE NOTICE 'Permissões de super_admin concedidas para murilloggomes@gmail.com';
END $$;
