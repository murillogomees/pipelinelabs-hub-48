
-- Tabela para armazenar logs de prompts e execuções de código
CREATE TABLE public.prompt_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  prompt TEXT NOT NULL,
  generated_code JSONB, -- Armazenar código gerado por tipo de arquivo
  model_used TEXT DEFAULT 'gpt-4o-mini',
  temperature NUMERIC DEFAULT 0.7,
  status TEXT CHECK (status IN ('pending', 'applied', 'error', 'rolled_back')) DEFAULT 'pending',
  error_message TEXT,
  applied_files JSONB DEFAULT '[]', -- Lista de arquivos modificados
  rollback_data JSONB, -- Dados para rollback
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE,
  rolled_back_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.prompt_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso - apenas super admins
CREATE POLICY "Super admins can manage prompt logs"
  ON public.prompt_logs
  FOR ALL
  USING (is_super_admin());

-- Função para trigger de updated_at
CREATE OR REPLACE FUNCTION update_prompt_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.applied_at = CASE 
    WHEN NEW.status = 'applied' AND OLD.status != 'applied' THEN now()
    ELSE OLD.applied_at
  END;
  
  NEW.rolled_back_at = CASE 
    WHEN NEW.status = 'rolled_back' AND OLD.status != 'rolled_back' THEN now()
    ELSE OLD.rolled_back_at
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER prompt_logs_updated_at
  BEFORE UPDATE ON public.prompt_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_logs_updated_at();
