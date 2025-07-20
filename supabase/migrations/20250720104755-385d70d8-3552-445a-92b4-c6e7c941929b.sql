-- Criar tabela para gerenciar conteúdo da landing page
CREATE TABLE public.landing_page_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  description text,
  image_url text,
  link_url text,
  button_text text,
  content_data jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.landing_page_content ENABLE ROW LEVEL SECURITY;

-- Política para super admins
CREATE POLICY "Super admins can manage landing content" 
ON public.landing_page_content 
FOR ALL 
USING (is_super_admin());

-- Política para leitura pública (landing page é pública)
CREATE POLICY "Public can view active landing content" 
ON public.landing_page_content 
FOR SELECT 
USING (is_active = true);

-- Trigger para updated_at
CREATE TRIGGER update_landing_page_content_updated_at
BEFORE UPDATE ON public.landing_page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir conteúdo inicial da landing page
INSERT INTO public.landing_page_content (section_key, title, subtitle, description, content_data) VALUES
('hero', 'Transforme Sua Gestão com o Pipeline Labs', 'O ERP Completo Para Pequenos Empreendedores', 'Sistema completo de gestão de vendas com serviços financeiros, feito para ajudar pequenos empreendedores a tomar decisões melhores.', '{"button_text": "Comece Grátis Agora", "video_url": "", "benefits": ["Automatize processos", "Facilite gestões estratégicas", "Integre com sistemas existentes"]}'),
('pain_section', 'Você Está Perdendo Tempo e Dinheiro?', 'Os Problemas Que Todo Empreendedor Enfrenta', 'Descubra como esses problemas estão impactando seu negócio diariamente.', '{"pain_points": [{"title": "Planilhas Desatualizadas", "description": "Controle manual gera erros e retrabalho"}, {"title": "Falta de Controle Multicanal", "description": "Vendas espalhadas sem visão unificada"}, {"title": "Processos Manuais", "description": "Tempo perdido com tarefas repetitivas"}]}'),
('features', 'Soluções Completas Para Seu Negócio', 'Tudo que Você Precisa em Um Só Lugar', 'Descubra como o Pipeline Labs resolve cada um dos seus problemas de gestão.', '{"features": [{"title": "Gestão de Estoque Inteligente", "description": "Controle automático com alertas e relatórios", "icon": "package"}, {"title": "Emissão Fiscal Automatizada", "description": "NFe, NFSe e NFCe em poucos cliques", "icon": "file-text"}, {"title": "Dashboard Financeiro", "description": "Visão completa do seu DRE em tempo real", "icon": "trending-up"}]}'),
('pricing', 'Planos que Cabem no Seu Orçamento', 'Escolha o Plano Ideal Para Seu Negócio', 'Comece grátis e evolua conforme sua empresa cresce.', '{"plans": [{"name": "Starter", "price": "0", "period": "30 dias grátis", "features": ["Até 100 produtos", "1 usuário", "Suporte por email"]}, {"name": "Professional", "price": "99", "period": "por mês", "features": ["Produtos ilimitados", "5 usuários", "Integrações", "Suporte prioritário"]}, {"name": "Enterprise", "price": "299", "period": "por mês", "features": ["Tudo do Professional", "Usuários ilimitados", "Whitelabel", "Suporte dedicado"]}]}');

-- Criar tabela para configurações gerais da landing page
CREATE TABLE public.landing_page_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  setting_type text DEFAULT 'text',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS para settings
ALTER TABLE public.landing_page_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para settings
CREATE POLICY "Super admins can manage landing settings" 
ON public.landing_page_settings 
FOR ALL 
USING (is_super_admin());

CREATE POLICY "Public can view landing settings" 
ON public.landing_page_settings 
FOR SELECT 
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_landing_page_settings_updated_at
BEFORE UPDATE ON public.landing_page_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações iniciais
INSERT INTO public.landing_page_settings (setting_key, setting_value, setting_type) VALUES
('primary_color', '#3b82f6', 'color'),
('secondary_color', '#10b981', 'color'),
('logo_url', '', 'image'),
('company_name', 'Pipeline Labs', 'text'),
('contact_email', 'contato@pipelinelabs.com.br', 'email'),
('contact_phone', '(11) 99999-9999', 'phone');