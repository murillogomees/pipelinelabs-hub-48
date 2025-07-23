-- Criar tabela para gerenciar conteúdo das seções da landing page
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

-- Inserir conteúdo da nova estrutura baseada no brief
INSERT INTO public.landing_page_content (section_key, title, subtitle, description, content_data) VALUES
('hero', 'Simplifique sua gestão. Fature, controle e cresça sem planilhas.', 'Teste grátis o ERP que entende a rotina de quem vende no Brasil.', 'Emitimos NFe, organizamos seu estoque e mostramos seu lucro de verdade.', '{"button_text": "Crie sua conta grátis", "secondary_button": "Ver como funciona", "trust_badge": "✨ Mais de 1.200 pequenos empreendedores já testaram o Pipeline Labs.", "mockup_features": ["Vendas do dia", "Notificações de pedidos", "Estoque e DRE visível"]}'),

('pain_section', 'A dor de cada negócio é diferente. O Pipeline resolve todas.', 'Blocos com transformações para cada persona', 'Veja como diferentes negócios superaram seus desafios.', '{"personas": [{"name": "Ana (Loja de Roupas)", "before": "Planilhas bagunçadas, não sabia o que mais vendia.", "after": "Agora vejo tudo no estoque em tempo real e emito nota com um clique.", "image_url": "/placeholder.svg"}, {"name": "Lucas (Marketplaces)", "before": "Tinha pedido na Shopee, estoque no caderno e entrega no caos.", "after": "Centralizei tudo num painel só. Nunca mais perdi uma venda.", "image_url": "/placeholder.svg"}, {"name": "Carla (Fábrica)", "before": "Não sabia se tínhamos lucro. Trabalhava no escuro.", "after": "O dashboard financeiro me mostra tudo. Agora faço metas reais.", "image_url": "/placeholder.svg"}, {"name": "Eduardo (Distribuidora)", "before": "Separar pedido era uma bagunça, com erro toda semana.", "after": "Cada pedido tem etiqueta e prioridade. Tudo flui.", "image_url": "/placeholder.svg"}, {"name": "Patrícia (Serviços)", "before": "Emitir nota era um parto. Finanças? Nem via.", "after": "Faço a NFSe direto pelo sistema e vejo quanto ganhei no mês.", "image_url": "/placeholder.svg"}]}'),

('features', 'O ERP completo, pensado para pequenos negócios', 'Tudo que Você Precisa em Um Só Lugar', 'Descubra como o Pipeline Labs resolve cada um dos seus problemas de gestão.', '{"features": [{"title": "Emissão de NFe, NFSe, NFCe", "description": "Todas as notas fiscais em poucos cliques", "icon": "file-text"}, {"title": "Painel financeiro com DRE", "description": "Visão completa do seu resultado em tempo real", "icon": "trending-up"}, {"title": "Estoque inteligente e automatizado", "description": "Controle automático com alertas e relatórios", "icon": "package"}, {"title": "Controle de pedidos com etiquetas", "description": "Integração com Melhor Envio para envios", "icon": "truck"}, {"title": "Ordem de produção e serviço", "description": "Organize processos produtivos e prestação de serviços", "icon": "clipboard-check"}, {"title": "Múltiplos depósitos e lista de preços", "description": "Gerencie vários locais e estratégias de preço", "icon": "building"}, {"title": "Integração com marketplaces", "description": "Mercado Livre, Shopee, Amazon sincronizados", "icon": "globe"}, {"title": "Painel whitelabel e permissões", "description": "Customize para sua marca e controle acessos", "icon": "users"}, {"title": "Certificados digitais (A1)", "description": "Armazene e use certificados com segurança", "icon": "shield"}], "cta_text": "Tudo isso já está disponível para você testar.", "cta_button": "Crie sua conta grátis"}'),

('mockups', 'Veja com seus olhos', 'Mockups das principais telas do sistema', 'Conheça as telas que você vai usar no dia a dia.', '{"mockups": [{"title": "Tela de vendas (PDV)", "description": "Vendas rápidas e intuitivas", "image_url": "/placeholder.svg"}, {"title": "Emissão fiscal", "description": "Passo-a-passo simplificado", "image_url": "/placeholder.svg"}, {"title": "Dashboard financeiro", "description": "Metas mensais e resultados", "image_url": "/placeholder.svg"}, {"title": "Estoque com alertas", "description": "Controle de baixo nível automático", "image_url": "/placeholder.svg"}, {"title": "Ordem de serviço", "description": "Checklist e acompanhamento", "image_url": "/placeholder.svg"}]}'),

('testimonials', 'O que nossos clientes dizem:', '3 cards com depoimentos reais', 'Feedback de quem usa o Pipeline Labs no dia a dia.', '{"testimonials": [{"name": "Júlia", "business": "Floricultura", "testimonial": "Economizei 5 horas por semana e parei de errar nota. Pipeline é meu sócio digital.", "image_url": "/placeholder.svg"}, {"name": "Marcos", "business": "Loja de Autopeças", "testimonial": "Nunca pensei que um ERP poderia ser tão fácil. Tudo está onde deveria estar.", "image_url": "/placeholder.svg"}, {"name": "Rafaela", "business": "Loja de cosméticos online", "testimonial": "Pedi ajuda no suporte e responderam em 3 minutos. Sério, virei fã.", "image_url": "/placeholder.svg"}]}'),

('security', 'Seguro, estável e em conformidade com a LGPD', 'Proteção e confiabilidade que você precisa', 'Sua operação e dados estão seguros conosco.', '{"security_items": [{"title": "Criptografia de ponta e certificados digitais", "icon": "lock"}, {"title": "Proteção com 2FA e acesso por permissão", "icon": "shield"}, {"title": "Backups diários automáticos (Supabase)", "icon": "database"}, {"title": "Ambiente 100% em nuvem, hospedado na Vercel", "icon": "cloud"}]}'),

('how_it_works', 'Comece agora em 3 passos', 'Processo simples para começar', 'Em poucos minutos você está usando o sistema.', '{"steps": [{"number": "1", "title": "Crie sua conta grátis", "description": "Email, CNPJ e senha. Sem cartão."}, {"number": "2", "title": "Escolha um plano de teste", "description": "Use por 30 dias com acesso aos módulos principais."}, {"number": "3", "title": "Veja seus resultados em 7 dias", "description": "Receba insights, relatórios e veja o impacto real."}]}'),

('final_cta', '30 dias para transformar sua gestão.', 'Crie sua conta agora. Em 5 minutos você está emitindo nota, controlando estoque e organizando suas finanças.', 'Call to action final com fundo destacado', '{"primary_button": "Comece agora grátis", "background_color": "#0f172a"}'),

('pricing', 'Planos que cabem no seu orçamento', 'Escolha o Plano Ideal Para Seu Negócio', 'Comece grátis e evolua conforme sua empresa cresce.', '{"plans": [{"name": "Starter", "price": "0", "period": "30 dias grátis", "features": ["Até 100 produtos", "1 usuário", "Suporte por email"], "highlighted": false}, {"name": "Professional", "price": "99", "period": "por mês", "features": ["Produtos ilimitados", "5 usuários", "Integrações", "Suporte prioritário"], "highlighted": true}, {"name": "Enterprise", "price": "299", "period": "por mês", "features": ["Tudo do Professional", "Usuários ilimitados", "Whitelabel", "Suporte dedicado"], "highlighted": false}]}');