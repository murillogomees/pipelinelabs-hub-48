-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info'::text,
  category TEXT NOT NULL DEFAULT 'system'::text,
  priority TEXT NOT NULL DEFAULT 'medium'::text,
  status TEXT NOT NULL DEFAULT 'unread'::text,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_via_email BOOLEAN DEFAULT FALSE,
  sent_via_whatsapp BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view company notifications"
ON public.notifications FOR SELECT
USING (
  can_access_company_data(company_id) OR 
  user_id = auth.uid() OR 
  is_super_admin()
);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
USING (
  can_access_company_data(company_id) OR 
  user_id = auth.uid() OR 
  is_super_admin()
);

CREATE POLICY "Admins can delete notifications"
ON public.notifications FOR DELETE
USING (
  can_manage_company_data(company_id) OR 
  is_super_admin()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Tabela de configurações de notificação por usuário
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_number TEXT,
  categories_enabled JSONB DEFAULT '{"system": true, "vendas": true, "financeiro": true, "estoque": true, "clientes": true, "produtos": true}'::jsonb,
  priority_levels JSONB DEFAULT '{"low": true, "medium": true, "high": true, "critical": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Habilitar RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para settings
CREATE POLICY "Users can manage their notification settings"
ON public.notification_settings FOR ALL
USING (user_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Função para criar notificações
CREATE OR REPLACE FUNCTION create_notification(
  p_company_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_category TEXT DEFAULT 'system',
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_send_email BOOLEAN DEFAULT FALSE,
  p_send_whatsapp BOOLEAN DEFAULT FALSE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Inserir notificação
  INSERT INTO public.notifications (
    company_id,
    user_id,
    title,
    message,
    type,
    category,
    priority,
    action_url,
    action_label,
    metadata,
    expires_at
  ) VALUES (
    p_company_id,
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_category,
    p_priority,
    p_action_url,
    p_action_label,
    p_metadata,
    p_expires_at
  ) RETURNING id INTO notification_id;
  
  -- Se deve enviar por email ou WhatsApp, atualizar flags
  IF p_send_email OR p_send_whatsapp THEN
    UPDATE public.notifications 
    SET 
      sent_via_email = p_send_email,
      sent_via_whatsapp = p_send_whatsapp
    WHERE id = notification_id;
  END IF;
  
  RETURN notification_id;
END;
$$;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.notifications
  SET 
    status = 'read',
    read_at = now(),
    updated_at = now()
  WHERE id = p_notification_id
    AND (user_id = auth.uid() OR can_access_company_data(company_id) OR is_super_admin());
    
  RETURN FOUND;
END;
$$;

-- Função para marcar múltiplas notificações como lidas
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_notification_ids UUID[]
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET 
    status = 'read',
    read_at = now(),
    updated_at = now()
  WHERE id = ANY(p_notification_ids)
    AND (user_id = auth.uid() OR can_access_company_data(company_id) OR is_super_admin());
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Função para limpar notificações expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE expires_at IS NOT NULL 
    AND expires_at < now()
    AND status = 'read';
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Habilitar realtime para notificações
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.notification_settings REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação do realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_settings;