
-- Criar tabela para histórico completo do projeto
CREATE TABLE IF NOT EXISTS public.project_history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response JSONB DEFAULT '{}',
  files_modified TEXT[] DEFAULT '{}',
  errors_fixed TEXT[] DEFAULT '{}',
  build_status TEXT NOT NULL DEFAULT 'pending',
  technical_decisions JSONB DEFAULT '[]',
  impact_level TEXT NOT NULL DEFAULT 'medium',
  similarity_hash TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_project_history_user_id ON public.project_history(user_id);
CREATE INDEX IF NOT EXISTS idx_project_history_company_id ON public.project_history(company_id);
CREATE INDEX IF NOT EXISTS idx_project_history_session_id ON public.project_history(session_id);
CREATE INDEX IF NOT EXISTS idx_project_history_similarity_hash ON public.project_history(similarity_hash);
CREATE INDEX IF NOT EXISTS idx_project_history_tags ON public.project_history USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_project_history_created_at ON public.project_history(created_at);

-- Criar tabela para sistema de aprendizado contínuo
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  feedback_score INTEGER,
  feedback_comment TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  prompt TEXT,
  analysis JSONB,
  implementation JSONB,
  build_result JSONB,
  user_feedback TEXT,
  improvements_made TEXT[] DEFAULT '{}'
);

-- Criar índices para learning_sessions
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON public.learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_company_id ON public.learning_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_session_id ON public.learning_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_tags ON public.learning_sessions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_created_at ON public.learning_sessions(created_at);

-- Criar tabela para base de conhecimento
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  effectiveness_score NUMERIC DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT,
  code_snippet TEXT,
  files_affected TEXT[] DEFAULT '{}',
  solution_type TEXT,
  success_rate NUMERIC DEFAULT 0.5
);

-- Criar índices para knowledge_base
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON public.knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_effectiveness_score ON public.knowledge_base(effectiveness_score);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_usage_count ON public.knowledge_base(usage_count);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_last_used ON public.knowledge_base(last_used);

-- Criar tabela para padrões de similaridade
CREATE TABLE IF NOT EXISTS public.similarity_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_hash TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB DEFAULT '{}',
  similarity_threshold NUMERIC DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para similarity_patterns
CREATE INDEX IF NOT EXISTS idx_similarity_patterns_pattern_hash ON public.similarity_patterns(pattern_hash);
CREATE INDEX IF NOT EXISTS idx_similarity_patterns_pattern_type ON public.similarity_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_similarity_patterns_similarity_threshold ON public.similarity_patterns(similarity_threshold);

-- RLS policies para project_history
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own project history"
  ON public.project_history
  FOR SELECT
  USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Users can insert their own project history"
  ON public.project_history
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Users can update their own project history"
  ON public.project_history
  FOR UPDATE
  USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Super admins can delete project history"
  ON public.project_history
  FOR DELETE
  USING (is_super_admin());

-- RLS policies para learning_sessions
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own learning sessions"
  ON public.learning_sessions
  FOR SELECT
  USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Users can insert their own learning sessions"
  ON public.learning_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Users can update their own learning sessions"
  ON public.learning_sessions
  FOR UPDATE
  USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Super admins can delete learning sessions"
  ON public.learning_sessions
  FOR DELETE
  USING (is_super_admin());

-- RLS policies para knowledge_base
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view knowledge base"
  ON public.knowledge_base
  FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage knowledge base"
  ON public.knowledge_base
  FOR ALL
  USING (is_super_admin());

-- RLS policies para similarity_patterns
ALTER TABLE public.similarity_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view similarity patterns"
  ON public.similarity_patterns
  FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage similarity patterns"
  ON public.similarity_patterns
  FOR ALL
  USING (is_super_admin());

-- Criar função para limpeza automática do histórico
CREATE OR REPLACE FUNCTION public.cleanup_project_history()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Manter apenas os últimos 10.000 registros por usuário
  DELETE FROM public.project_history
  WHERE id NOT IN (
    SELECT id FROM public.project_history
    ORDER BY created_at DESC
    LIMIT 10000
  );
  
  -- Manter apenas registros dos últimos 6 meses
  DELETE FROM public.project_history
  WHERE created_at < now() - interval '6 months';
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_project_history_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER project_history_updated_at
  BEFORE UPDATE ON public.project_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_history_updated_at();

CREATE TRIGGER learning_sessions_updated_at
  BEFORE UPDATE ON public.learning_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_history_updated_at();

CREATE TRIGGER knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_history_updated_at();

CREATE TRIGGER similarity_patterns_updated_at
  BEFORE UPDATE ON public.similarity_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_history_updated_at();
