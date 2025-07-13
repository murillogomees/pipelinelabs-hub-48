-- Criar tabela de notificações
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  user_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificações
CREATE POLICY "Company scoped select notifications" 
ON public.notifications 
FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company scoped update notifications" 
ON public.notifications 
FOR UPDATE 
USING (company_id = get_user_company_id());

CREATE POLICY "Company scoped delete notifications" 
ON public.notifications 
FOR DELETE 
USING (company_id = get_user_company_id());

-- Trigger para updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;