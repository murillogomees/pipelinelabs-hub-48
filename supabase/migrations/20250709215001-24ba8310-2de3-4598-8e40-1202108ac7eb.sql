-- Garantir que a empresa Pipeline Labs existe com dados completos
-- Primeiro verificar se já existe, se não existir, inserir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE name = 'Pipeline Labs') THEN
    INSERT INTO public.companies (
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
      'Pipeline Labs',
      '12.345.678/0001-90',
      'contato@pipelinelabs.com.br',
      '(11) 3456-7890',
      'Av. Paulista, 1000 - Sala 1001',
      'São Paulo',
      'SP',
      '01310-100',
      now(),
      now()
    );
  ELSE
    -- Atualizar dados se já existir
    UPDATE public.companies 
    SET 
      document = '12.345.678/0001-90',
      email = 'contato@pipelinelabs.com.br',
      phone = '(11) 3456-7890',
      address = 'Av. Paulista, 1000 - Sala 1001',
      city = 'São Paulo',
      state = 'SP',
      zipcode = '01310-100',
      updated_at = now()
    WHERE name = 'Pipeline Labs';
  END IF;
END
$$;