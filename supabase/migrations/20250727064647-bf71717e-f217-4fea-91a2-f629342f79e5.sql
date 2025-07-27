
-- Criar tabela para histórico de auditorias
CREATE TABLE public.auditoria_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_id UUID REFERENCES public.companies NOT NULL,
  tipo_auditoria TEXT NOT NULL, -- 'manual', 'automatica', 'agendada'
  escopo_auditoria JSONB NOT NULL DEFAULT '{}', -- arquivos, hooks, componentes, etc
  arquivos_analisados INTEGER NOT NULL DEFAULT 0,
  problemas_encontrados INTEGER NOT NULL DEFAULT 0,
  sugestoes_limpeza JSONB NOT NULL DEFAULT '[]',
  arquivos_duplicados JSONB NOT NULL DEFAULT '[]',
  arquivos_nao_utilizados JSONB NOT NULL DEFAULT '[]',
  hooks_nao_utilizados JSONB NOT NULL DEFAULT '[]',
  componentes_duplicados JSONB NOT NULL DEFAULT '[]',
  tempo_execucao_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'executando', -- 'executando', 'concluida', 'erro', 'cancelada'
  erro_detalhes TEXT,
  melhorias_aplicadas JSONB NOT NULL DEFAULT '[]',
  feedback_usuario TEXT,
  score_aprendizado NUMERIC NOT NULL DEFAULT 0.0,
  padroes_aprendidos JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações de auditoria
CREATE TABLE public.auditoria_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies NOT NULL,
  auditoria_ativa BOOLEAN NOT NULL DEFAULT false,
  frequencia_cron TEXT NOT NULL DEFAULT '0 2 * * *', -- 2:00 AM diariamente
  escopo_padrao JSONB NOT NULL DEFAULT '{
    "arquivos": true,
    "hooks": true,
    "componentes": true,
    "paginas": true,
    "estilos": true,
    "edge_functions": true,
    "tabelas": true,
    "rotas": true
  }',
  notificacoes_ativas BOOLEAN NOT NULL DEFAULT true,
  email_notificacao TEXT,
  webhook_notificacao TEXT,
  limite_problemas_alerta INTEGER NOT NULL DEFAULT 50,
  manter_historico_dias INTEGER NOT NULL DEFAULT 90,
  auto_limpeza_segura BOOLEAN NOT NULL DEFAULT false,
  regras_preservacao JSONB NOT NULL DEFAULT '{
    "preservar_producao": true,
    "preservar_autenticacao": true,
    "preservar_paginas_ativas": true,
    "preservar_hooks_sistema": true
  }',
  ultima_execucao TIMESTAMP WITH TIME ZONE,
  proxima_execucao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para auditoria_historico
ALTER TABLE public.auditoria_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company auditoria_historico access" ON public.auditoria_historico
FOR SELECT USING (can_access_company_data(company_id));

CREATE POLICY "Company auditoria_historico management" ON public.auditoria_historico
FOR INSERT WITH CHECK (can_access_company_data(company_id) AND has_specific_permission('admin', company_id));

CREATE POLICY "Company auditoria_historico update" ON public.auditoria_historico
FOR UPDATE USING (can_access_company_data(company_id) AND has_specific_permission('admin', company_id));

CREATE POLICY "Company auditoria_historico delete" ON public.auditoria_historico
FOR DELETE USING (can_manage_company_data(company_id));

-- Adicionar RLS para auditoria_config
ALTER TABLE public.auditoria_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company auditoria_config access" ON public.auditoria_config
FOR SELECT USING (can_access_company_data(company_id));

CREATE POLICY "Company auditoria_config management" ON public.auditoria_config
FOR INSERT WITH CHECK (can_manage_company_data(company_id));

CREATE POLICY "Company auditoria_config update" ON public.auditoria_config
FOR UPDATE USING (can_manage_company_data(company_id));

CREATE POLICY "Company auditoria_config delete" ON public.auditoria_config
FOR DELETE USING (can_manage_company_data(company_id));

-- Criar triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_auditoria_historico_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_auditoria_historico_updated_at
  BEFORE UPDATE ON public.auditoria_historico
  FOR EACH ROW
  EXECUTE FUNCTION public.update_auditoria_historico_updated_at();

CREATE OR REPLACE FUNCTION public.update_auditoria_config_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_auditoria_config_updated_at
  BEFORE UPDATE ON public.auditoria_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_auditoria_config_updated_at();

-- Criar função para executar auditoria automatizada
CREATE OR REPLACE FUNCTION public.executar_auditoria_automatica(p_company_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  auditoria_id UUID;
  config_data RECORD;
BEGIN
  -- Verificar se existe configuração ativa
  SELECT * INTO config_data
  FROM public.auditoria_config
  WHERE company_id = p_company_id AND auditoria_ativa = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auditoria não configurada ou inativa para esta empresa';
  END IF;
  
  -- Criar registro de auditoria
  INSERT INTO public.auditoria_historico (
    user_id,
    company_id,
    tipo_auditoria,
    escopo_auditoria,
    status
  ) VALUES (
    COALESCE(auth.uid(), (SELECT id FROM auth.users LIMIT 1)),
    p_company_id,
    'automatica',
    config_data.escopo_padrao,
    'executando'
  ) RETURNING id INTO auditoria_id;
  
  -- Atualizar ultima execução
  UPDATE public.auditoria_config
  SET ultima_execucao = now(),
      proxima_execucao = now() + interval '1 day'
  WHERE company_id = p_company_id;
  
  RETURN auditoria_id;
END;
$$;

-- Criar função para agendar próxima execução
CREATE OR REPLACE FUNCTION public.agendar_proxima_auditoria()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar todas as configurações ativas para próxima execução
  UPDATE public.auditoria_config
  SET proxima_execucao = CASE
    WHEN frequencia_cron = '0 2 * * *' THEN -- diário às 2:00
      (CURRENT_DATE + interval '1 day' + interval '2 hours')
    WHEN frequencia_cron = '0 2 * * 1' THEN -- semanal segunda às 2:00
      (CURRENT_DATE + interval '1 week' - interval '1 day' * EXTRACT(DOW FROM CURRENT_DATE) + interval '1 day' + interval '2 hours')
    ELSE
      (CURRENT_DATE + interval '1 day' + interval '2 hours')
  END
  WHERE auditoria_ativa = true AND proxima_execucao < now();
END;
$$;
