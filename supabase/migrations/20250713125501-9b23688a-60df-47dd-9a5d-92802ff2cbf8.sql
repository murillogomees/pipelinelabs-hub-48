-- Inserir empresa Pipeline Labs
INSERT INTO public.companies (
  id,
  name,
  document,
  email,
  phone,
  address,
  city,
  state,
  zipcode,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Pipeline Labs',
  '12.345.678/0001-90',
  'contato@pipelinelabs.com.br',
  '(11) 99999-9999',
  'Rua das Tecnologias, 123',
  'São Paulo',
  'SP',
  '01234-567',
  now(),
  now()
);

-- Obter o ID da empresa recém-criada
DO $$
DECLARE
  company_uuid uuid;
  user_uuid uuid;
BEGIN
  -- Buscar o ID da empresa Pipeline Labs
  SELECT id INTO company_uuid FROM public.companies WHERE name = 'Pipeline Labs' LIMIT 1;
  
  -- Verificar se o usuário existe na tabela auth.users primeiro
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'murilloggomes@gmail.com' LIMIT 1;
  
  IF user_uuid IS NULL THEN
    -- Se o usuário não existe no auth, vamos criar um UUID fixo para ele
    -- Em um cenário real, o usuário deveria se cadastrar primeiro
    user_uuid := gen_random_uuid();
    
    -- Criar um perfil para o usuário (simulando que ele existe)
    INSERT INTO public.profiles (
      id,
      user_id,
      display_name,
      email,
      phone,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      user_uuid,
      'Murillo Gomes',
      'murilloggomes@gmail.com',
      '(11) 98888-7777',
      true,
      now(),
      now()
    );
  ELSE
    -- Se o usuário existe no auth, verificar se tem perfil
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = user_uuid) THEN
      INSERT INTO public.profiles (
        id,
        user_id,
        display_name,
        email,
        phone,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        user_uuid,
        'Murillo Gomes',
        'murilloggomes@gmail.com',
        '(11) 98888-7777',
        true,
        now(),
        now()
      );
    END IF;
  END IF;
  
  -- Criar a relação user_companies (usuário como admin da empresa)
  INSERT INTO public.user_companies (
    id,
    user_id,
    company_id,
    role,
    is_active,
    permissions,
    created_at,
    invited_by
  ) VALUES (
    gen_random_uuid(),
    user_uuid,
    company_uuid,
    'admin',
    true,
    '{"full_access": true, "admin_panel": true, "user_management": true, "company_settings": true}',
    now(),
    null
  );
  
  -- Criar configurações básicas para a empresa
  INSERT INTO public.company_settings (
    id,
    company_id,
    regime_tributario,
    cfop_padrao,
    serie_nfe,
    nfe_environment,
    estoque_tolerancia_minima,
    crossdocking_padrao,
    idioma,
    timezone,
    moeda,
    certificado_status,
    funcionalidades_ativas,
    formas_pagamento_ativas,
    notificacoes,
    branding,
    impostos_padrao,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    company_uuid,
    'Simples Nacional',
    '5.102',
    '1',
    'dev',
    10,
    0,
    'pt-BR',
    'America/Sao_Paulo',
    'BRL',
    'inactive',
    '{"vendas": true, "estoque": true, "financeiro": true, "producao": true, "nfe": true, "relatorios": true}',
    '["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia", "boleto"]',
    '{"email_notifications": true, "sms_notifications": false, "push_notifications": true}',
    '{"logo_url": "", "primary_color": "#2563eb", "secondary_color": "#64748b", "company_name": "Pipeline Labs"}',
    '{"icms": 18, "ipi": 0, "pis": 1.65, "cofins": 7.6}',
    now(),
    now()
  );
  
END $$;