-- Atualizar a estrutura de landing_page_content para suportar todas as seções especificadas
UPDATE public.landing_page_content 
SET content_data = '{"button_text": "Crie sua conta grátis", "secondary_button": "Ver como funciona", "trust_badge": "✨ Mais de 1.200 pequenos empreendedores já testaram o Pipeline Labs.", "benefits": ["Automatize processos", "Facilite gestões estratégicas", "Integre com sistemas existentes"]}'
WHERE section_key = 'hero';

-- Atualizar seção de dores
UPDATE public.landing_page_content 
SET title = 'A dor de cada negócio é diferente. O Pipeline resolve todas.',
    subtitle = 'Blocos com transformações para cada persona',
    content_data = '{
      "personas": [
        {
          "name": "Ana (Loja de Roupas)", 
          "before": "Planilhas bagunçadas, não sabia o que mais vendia.",
          "after": "Agora vejo tudo no estoque em tempo real e emito nota com um clique.",
          "image_url": ""
        },
        {
          "name": "Lucas (Marketplaces)", 
          "before": "Tinha pedido na Shopee, estoque no caderno e entrega no caos.",
          "after": "Centralizei tudo num painel só. Nunca mais perdi uma venda.",
          "image_url": ""
        },
        {
          "name": "Carla (Fábrica)", 
          "before": "Não sabia se tínhamos lucro. Trabalhava no escuro.",
          "after": "O dashboard financeiro me mostra tudo. Agora faço metas reais.",
          "image_url": ""
        },
        {
          "name": "Eduardo (Distribuidora)", 
          "before": "Separar pedido era uma bagunça, com erro toda semana.",
          "after": "Cada pedido tem etiqueta e prioridade. Tudo flui.",
          "image_url": ""
        },
        {
          "name": "Patrícia (Serviços)", 
          "before": "Emitir nota era um parto. Finanças? Nem via.",
          "after": "Faço a NFSe direto pelo sistema e vejo quanto ganhei no mês.",
          "image_url": ""
        }
      ]
    }'
WHERE section_key = 'pain_section';

-- Atualizar seção de recursos
UPDATE public.landing_page_content 
SET title = 'O ERP completo, pensado para pequenos negócios',
    subtitle = 'Tudo que Você Precisa em Um Só Lugar',
    content_data = '{
      "features": [
        {"title": "Emissão de NFe, NFSe, NFCe", "description": "Todas as notas fiscais em poucos cliques", "icon": "file-text"},
        {"title": "Painel financeiro com DRE", "description": "Visão completa do seu resultado em tempo real", "icon": "trending-up"},
        {"title": "Estoque inteligente e automatizado", "description": "Controle automático com alertas e relatórios", "icon": "package"},
        {"title": "Controle de pedidos com etiquetas", "description": "Integração com Melhor Envio para envios", "icon": "truck"},
        {"title": "Ordem de produção e serviço", "description": "Organize processos produtivos e prestação de serviços", "icon": "clipboard-check"},
        {"title": "Múltiplos depósitos e lista de preços", "description": "Gerencie vários locais e estratégias de preço", "icon": "building"},
        {"title": "Integração com marketplaces", "description": "Mercado Livre, Shopee, Amazon sincronizados", "icon": "globe"},
        {"title": "Painel whitelabel e permissões", "description": "Customize para sua marca e controle acessos", "icon": "users"},
        {"title": "Certificados digitais (A1)", "description": "Armazene e use certificados com segurança", "icon": "shield"}
      ],
      "cta_text": "Tudo isso já está disponível para você testar.",
      "cta_button": "Crie sua conta grátis"
    }'
WHERE section_key = 'features';

-- Inserir nova seção de mockups/visualização
INSERT INTO public.landing_page_content (section_key, title, subtitle, description, content_data) VALUES
('mockups', 'Veja com seus olhos', 'Mockups das principais telas do sistema', 'Conheça as telas que você vai usar no dia a dia.', '{"mockups": [{"title": "Tela de vendas (PDV)", "description": "Vendas rápidas e intuitivas", "image_url": ""}, {"title": "Emissão fiscal", "description": "Passo-a-passo simplificado", "image_url": ""}, {"title": "Dashboard financeiro", "description": "Metas mensais e resultados", "image_url": ""}, {"title": "Estoque com alertas", "description": "Controle de baixo nível automático", "image_url": ""}, {"title": "Ordem de serviço", "description": "Checklist e acompanhamento", "image_url": ""}]}')
ON CONFLICT (section_key) DO UPDATE SET
title = EXCLUDED.title,
subtitle = EXCLUDED.subtitle,
description = EXCLUDED.description,
content_data = EXCLUDED.content_data;

-- Inserir seção de depoimentos
INSERT INTO public.landing_page_content (section_key, title, subtitle, description, content_data) VALUES
('testimonials', 'O que nossos clientes dizem:', '3 cards com depoimentos reais', 'Feedback de quem usa o Pipeline Labs no dia a dia.', '{"testimonials": [{"name": "Júlia", "business": "Floricultura", "testimonial": "Economizei 5 horas por semana e parei de errar nota. Pipeline é meu sócio digital.", "image_url": ""}, {"name": "Marcos", "business": "Loja de Autopeças", "testimonial": "Nunca pensei que um ERP poderia ser tão fácil. Tudo está onde deveria estar.", "image_url": ""}, {"name": "Rafaela", "business": "Loja de cosméticos online", "testimonial": "Pedi ajuda no suporte e responderam em 3 minutos. Sério, virei fã.", "image_url": ""}]}')
ON CONFLICT (section_key) DO UPDATE SET
title = EXCLUDED.title,
subtitle = EXCLUDED.subtitle,
description = EXCLUDED.description,
content_data = EXCLUDED.content_data;

-- Inserir seção de confiança e segurança
INSERT INTO public.landing_page_content (section_key, title, subtitle, description, content_data) VALUES
('security', 'Seguro, estável e em conformidade com a LGPD', 'Proteção e confiabilidade que você precisa', 'Sua operação e dados estão seguros conosco.', '{"security_items": [{"title": "Criptografia de ponta e certificados digitais", "icon": "lock"}, {"title": "Proteção com 2FA e acesso por permissão", "icon": "shield"}, {"title": "Backups diários automáticos (Supabase)", "icon": "database"}, {"title": "Ambiente 100% em nuvem, hospedado na Vercel", "icon": "cloud"}]}')
ON CONFLICT (section_key) DO UPDATE SET
title = EXCLUDED.title,
subtitle = EXCLUDED.subtitle,
description = EXCLUDED.description,
content_data = EXCLUDED.content_data;

-- Inserir seção como funciona
INSERT INTO public.landing_page_content (section_key, title, subtitle, description, content_data) VALUES
('how_it_works', 'Comece agora em 3 passos', 'Processo simples para começar', 'Em poucos minutos você está usando o sistema.', '{"steps": [{"number": "1", "title": "Crie sua conta grátis", "description": "Email, CNPJ e senha. Sem cartão."}, {"number": "2", "title": "Escolha um plano de teste", "description": "Use por 30 dias com acesso aos módulos principais."}, {"number": "3", "title": "Veja seus resultados em 7 dias", "description": "Receba insights, relatórios e veja o impacto real."}]}')
ON CONFLICT (section_key) DO UPDATE SET
title = EXCLUDED.title,
subtitle = EXCLUDED.subtitle,
description = EXCLUDED.description,
content_data = EXCLUDED.content_data;

-- Inserir CTA final
INSERT INTO public.landing_page_content (section_key, title, subtitle, description, content_data) VALUES
('final_cta', '30 dias para transformar sua gestão.', 'Crie sua conta agora. Em 5 minutos você está emitindo nota, controlando estoque e organizando suas finanças.', 'Call to action final com fundo destacado', '{"primary_button": "Comece agora grátis", "background_color": "#0f172a"}')
ON CONFLICT (section_key) DO UPDATE SET
title = EXCLUDED.title,
subtitle = EXCLUDED.subtitle,
description = EXCLUDED.description,
content_data = EXCLUDED.content_data;

-- Atualizar hero com novo conteúdo
UPDATE public.landing_page_content 
SET title = 'Simplifique sua gestão. Fature, controle e cresça sem planilhas.',
    subtitle = 'Teste grátis o ERP que entende a rotina de quem vende no Brasil.',
    description = 'Emitimos NFe, organizamos seu estoque e mostramos seu lucro de verdade.',
    content_data = '{
      "button_text": "Crie sua conta grátis", 
      "secondary_button": "Ver como funciona",
      "trust_badge": "✨ Mais de 1.200 pequenos empreendedores já testaram o Pipeline Labs.",
      "benefits": ["Automatize processos", "Facilite gestões estratégicas", "Integre com sistemas existentes"],
      "mockup_features": ["Vendas do dia", "Notificações de pedidos", "Estoque e DRE visível"]
    }'
WHERE section_key = 'hero';