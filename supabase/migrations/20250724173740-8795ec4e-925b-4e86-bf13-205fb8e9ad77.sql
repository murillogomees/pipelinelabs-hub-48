-- Criar tabela para o Engineering Notes Copilot
CREATE TABLE public.copilot_engineer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  notes TEXT NOT NULL,
  tag TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.copilot_engineer_notes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso - apenas administradores podem acessar
CREATE POLICY "Super admins can manage all engineering notes" 
ON public.copilot_engineer_notes 
FOR ALL 
USING (is_super_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_copilot_engineer_notes_updated_at
BEFORE UPDATE ON public.copilot_engineer_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_copilot_engineer_notes_user_id ON public.copilot_engineer_notes(user_id);
CREATE INDEX idx_copilot_engineer_notes_tag ON public.copilot_engineer_notes(tag);
CREATE INDEX idx_copilot_engineer_notes_created_at ON public.copilot_engineer_notes(created_at DESC);