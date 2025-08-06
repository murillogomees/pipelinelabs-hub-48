-- Teste direto da função is_super_admin() para o usuário específico
DO $$
DECLARE
    user_uuid uuid := '9e13b8e0-e674-4413-a5dc-71a2396aa867';
    access_level_name_result text;
    is_super_result boolean;
BEGIN
    -- Buscar o nome do access_level do usuário diretamente
    SELECT al.name INTO access_level_name_result
    FROM public.profiles p
    JOIN public.access_levels al ON p.access_level_id = al.id
    WHERE p.user_id = user_uuid AND p.is_active = true AND al.is_active = true;
    
    -- Verificar se é super_admin
    is_super_result := COALESCE(access_level_name_result = 'super_admin', false);
    
    RAISE NOTICE 'User ID: %, Access Level: %, Is Super Admin: %', user_uuid, access_level_name_result, is_super_result;
END $$;