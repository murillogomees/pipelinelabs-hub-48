-- Criar tabela para configurações de relatórios personalizados
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  chart_type TEXT NOT NULL DEFAULT 'bar',
  data_sources TEXT[] NOT NULL DEFAULT '{}',
  metrics TEXT[] NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para reports
CREATE POLICY "Company scoped select reports" 
ON public.reports 
FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped insert reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company scoped update reports" 
ON public.reports 
FOR UPDATE 
USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped delete reports" 
ON public.reports 
FOR DELETE 
USING (company_id = get_user_company_id());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();