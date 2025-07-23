-- Inserir dados das personas na tabela landing_page_content
INSERT INTO landing_page_content (section_key, title, subtitle, content_data, is_active, display_order) 
VALUES (
  'personas',
  'Histórias reais de quem transformou o negócio',
  'Cada empreendedor tem sua dor. Veja como o Pipeline Labs resolveu problemas específicos.',
  '{
    "personas": [
      {
        "id": 1,
        "name": "Carla Santos",
        "age": 41,
        "business": "Fábrica de Salgados Artesanais", 
        "location": "Belo Horizonte/MG",
        "situation": "Divorciada • 2 filhos",
        "problems": [
          "Sem visão financeira clara do negócio",
          "Pedidos de produção confusos e manuais", 
          "Planilhas desorganizadas tomavam muito tempo"
        ],
        "solutions": [
          "<strong>DRE automático</strong> com metas e lucros reais",
          "<strong>Controle de produção</strong> otimizado por demanda",
          "<strong>Integração completa</strong> estoque + vendas + financeiro"
        ],
        "result": "Carla conseguiu contratar 2 funcionários e dobrar sua produção, mantendo total controle financeiro e operacional.",
        "image": "/src/assets/carla-persona.jpg"
      },
      {
        "id": 2,
        "name": "Lucas Silva",
        "age": 28,
        "business": "Vendedor de Marketplaces",
        "location": "Salvador/BA", 
        "situation": "Solteiro • E-commerce",
        "problems": [
          "Vendas espalhadas em múltiplas plataformas",
          "Pedidos controlados manualmente",
          "Controle de estoque ruim e desatualizado"
        ],
        "solutions": [
          "<strong>Centralização de pedidos</strong> de todos marketplaces",
          "<strong>Estoque sincronizado</strong> automaticamente", 
          "<strong>Etiquetas automáticas</strong> integradas com envios"
        ],
        "result": "Lucas aumentou suas vendas em 40% e reduziu o tempo de gestão de 6h para 1h por dia.",
        "image": "/src/assets/lucas-persona-card.jpg"
      },
      {
        "id": 3,
        "name": "Ana Costa", 
        "age": 34,
        "business": "Loja de Roupas Femininas",
        "location": "Campinas/SP",
        "situation": "Casada • 1 filho",
        "problems": [
          "Estoque desorganizado sem controle",
          "Notas fiscais emitidas manualmente", 
          "Falta de tempo para gestão estratégica"
        ],
        "solutions": [
          "<strong>Emissão automática</strong> de notas fiscais",
          "<strong>Estoque em tempo real</strong> com alertas",
          "<strong>Painel de vendas</strong> visual e simplificado"
        ],
        "result": "Ana organizou completamente sua loja e conseguiu focar mais na escolha de produtos e atendimento ao cliente.",
        "image": "/src/assets/ana-persona.jpg"
      },
      {
        "id": 4,
        "name": "Eduardo Martins",
        "age": 38, 
        "business": "Distribuidor de Bebidas",
        "location": "Porto Alegre/RS",
        "situation": "Casado • 2 filhos",
        "problems": [
          "Separação de pedidos bagunçada e lenta",
          "Logística de entrega sem planejamento",
          "Falhas no controle de estoque"
        ],
        "solutions": [
          "<strong>Roteirização inteligente</strong> com etiquetas",
          "<strong>Controle integrado</strong> de estoque e envios",
          "<strong>Separação otimizada</strong> de pedidos por rota"
        ],
        "result": "Eduardo reduziu o tempo de separação em 60% e melhorou drasticamente a pontualidade das entregas.",
        "image": "/src/assets/eduardo-persona.jpg"
      },
      {
        "id": 5,
        "name": "Patrícia Lima",
        "age": 32,
        "business": "Prestadora de Serviços (Designer)",
        "location": "Fortaleza/CE",
        "situation": "Solteira • Freelancer", 
        "problems": [
          "Emissão de NFSe era lenta e complicada",
          "Sem gestão financeira organizada",
          "Controle de projetos manual e confuso"
        ],
        "solutions": [
          "<strong>NFSe automática</strong> em poucos cliques",
          "<strong>Painel financeiro</strong> com entradas e saídas",
          "<strong>Fluxo de caixa</strong> visual e em tempo real"
        ],
        "result": "Patrícia triplicou o número de clientes atendidos e organizou completamente suas finanças pessoais e profissionais.",
        "image": "/src/assets/patricia-persona.jpg"
      },
      {
        "id": 6,
        "name": "João Santos",
        "age": 45,
        "business": "Loja de Autopeças (Física + Online)",
        "location": "Ribeirão Preto/SP",
        "situation": "Casado • 1 filho adulto",
        "problems": [
          "Estoque físico e digital não batiam",
          "Vendas duplicadas entre canais", 
          "Controle manual gerava erros constantes"
        ],
        "solutions": [
          "<strong>Estoque unificado</strong> físico + online",
          "<strong>PDV integrado</strong> com emissão de notas",
          "<strong>Painel multicanal</strong> centralizado"
        ],
        "result": "João eliminou completamente as divergências de estoque e aumentou a confiança dos clientes na disponibilidade dos produtos.",
        "image": "/src/assets/joao-persona.jpg"
      }
    ]
  }'::jsonb,
  true,
  3
) ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle, 
  content_data = EXCLUDED.content_data,
  updated_at = now();