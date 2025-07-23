import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// DEPRECATED: Use useLandingPageContent instead
// This hook is kept for backward compatibility only

export interface LandingPageConfig {
  id?: string;
  company_id?: string;
  config_name: string;
  company_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  hero_title: string;
  hero_subtitle: string;
  hero_badge: string;
  hero_cta_button: string;
  hero_secondary_button: string;
  show_problems: boolean;
  show_personas: boolean;
  show_features: boolean;
  show_pricing: boolean;
  show_mockups: boolean;
  personas: any[];
  features: any[];
  pricing_plans: any[];
  custom_sections?: any;
  is_active: boolean;
}

export function useLandingPageConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['landing-page-config'],
    queryFn: async () => {
      try {
        // Por enquanto, usar localStorage até as funções do banco estarem prontas
        const stored = localStorage.getItem('landing-page-config');
        if (stored) {
          return { ...getDefaultConfig(), ...JSON.parse(stored) };
        }
        return getDefaultConfig();
      } catch (error) {
        console.log('Error fetching config, using default:', error);
        return getDefaultConfig();
      }
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<LandingPageConfig>) => {
      try {
        // Por enquanto, salvar no localStorage até as funções do banco estarem prontas
        const currentConfig = config || getDefaultConfig();
        const newConfig = { ...currentConfig, ...updates };
        localStorage.setItem('landing-page-config', JSON.stringify(newConfig));
        return newConfig;
      } catch (error) {
        console.error('Error saving config:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-config'] });
      toast({
        title: "Configuração salva",
        description: "As alterações da landing page foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating config:', error);
      toast({
        title: "Erro ao salvar",
        description: "Houve um erro ao salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  return {
    config: config || getDefaultConfig(),
    isLoading,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
  };
}

function getDefaultConfig(): LandingPageConfig {
  return {
    config_name: 'default',
    company_name: 'Pipeline Labs',
    primary_color: '#0f172a',
    secondary_color: '#64748b',
    font_family: 'Inter',
    hero_title: 'Sistema Completo de Gestão para Pequenos Empreendedores',
    hero_subtitle: 'Automatize processos, facilite gestões estratégicas e financeiras',
    hero_badge: '🚀 ERP Inteligente e Dinâmico',
    hero_cta_button: 'Começar Teste Grátis',
    hero_secondary_button: 'Ver Demo',
    show_problems: true,
    show_personas: true,
    show_features: true,
    show_pricing: true,
    show_mockups: true,
    personas: [
      {
        id: 1,
        name: "Carla Santos",
        age: 41,
        business: "Fábrica de Salgados Artesanais",
        location: "Belo Horizonte/MG",
        situation: "Divorciada • 2 filhos",
        problems: [
          "Sem visão financeira clara do negócio",
          "Pedidos de produção confusos e manuais",
          "Planilhas desorganizadas tomavam muito tempo"
        ],
        solutions: [
          "<strong>DRE automático</strong> com metas e lucros reais",
          "<strong>Controle de produção</strong> otimizado por demanda",
          "<strong>Integração completa</strong> estoque + vendas + financeiro"
        ],
        result: "Carla conseguiu contratar 2 funcionários e dobrar sua produção, mantendo total controle financeiro e operacional.",
        image: "/src/assets/carla-persona.jpg"
      },
      {
        id: 2,
        name: "Lucas Silva",
        age: 28,
        business: "Vendedor de Marketplaces",
        location: "Salvador/BA",
        situation: "Solteiro • E-commerce",
        problems: [
          "Vendas espalhadas em múltiplas plataformas",
          "Pedidos controlados manualmente",
          "Controle de estoque ruim e desatualizado"
        ],
        solutions: [
          "<strong>Centralização de pedidos</strong> de todos marketplaces",
          "<strong>Estoque sincronizado</strong> automaticamente",
          "<strong>Etiquetas automáticas</strong> integradas com envios"
        ],
        result: "Lucas aumentou suas vendas em 40% e reduziu o tempo de gestão de 6h para 1h por dia.",
        image: "/src/assets/lucas-persona-card.jpg"
      },
      {
        id: 3,
        name: "Ana Costa",
        age: 34,
        business: "Loja de Roupas Femininas",
        location: "Campinas/SP",
        situation: "Casada • 1 filho",
        problems: [
          "Estoque desorganizado sem controle",
          "Notas fiscais emitidas manualmente",
          "Falta de tempo para gestão estratégica"
        ],
        solutions: [
          "<strong>Emissão automática</strong> de notas fiscais",
          "<strong>Estoque em tempo real</strong> com alertas",
          "<strong>Painel de vendas</strong> visual e simplificado"
        ],
        result: "Ana organizou completamente sua loja e conseguiu focar mais na escolha de produtos e atendimento ao cliente.",
        image: "/src/assets/ana-persona.jpg"
      },
      {
        id: 4,
        name: "Eduardo Martins",
        age: 38,
        business: "Distribuidor de Bebidas",
        location: "Porto Alegre/RS",
        situation: "Casado • 2 filhos",
        problems: [
          "Separação de pedidos bagunçada e lenta",
          "Logística de entrega sem planejamento",
          "Falhas no controle de estoque"
        ],
        solutions: [
          "<strong>Roteirização inteligente</strong> com etiquetas",
          "<strong>Controle integrado</strong> de estoque e envios",
          "<strong>Separação otimizada</strong> de pedidos por rota"
        ],
        result: "Eduardo reduziu o tempo de separação em 60% e melhorou drasticamente a pontualidade das entregas.",
        image: "/src/assets/eduardo-persona.jpg"
      },
      {
        id: 5,
        name: "Patrícia Lima",
        age: 32,
        business: "Prestadora de Serviços (Designer)",
        location: "Fortaleza/CE",
        situation: "Solteira • Freelancer",
        problems: [
          "Emissão de NFSe era lenta e complicada",
          "Sem gestão financeira organizada",
          "Controle de projetos manual e confuso"
        ],
        solutions: [
          "<strong>NFSe automática</strong> em poucos cliques",
          "<strong>Painel financeiro</strong> com entradas e saídas",
          "<strong>Fluxo de caixa</strong> visual e em tempo real"
        ],
        result: "Patrícia triplicou o número de clientes atendidos e organizou completamente suas finanças pessoais e profissionais.",
        image: "/src/assets/patricia-persona.jpg"
      },
      {
        id: 6,
        name: "João Santos",
        age: 45,
        business: "Loja de Autopeças (Física + Online)",
        location: "Ribeirão Preto/SP",
        situation: "Casado • 1 filho adulto",
        problems: [
          "Estoque físico e digital não batiam",
          "Vendas duplicadas entre canais",
          "Controle manual gerava erros constantes"
        ],
        solutions: [
          "<strong>Estoque unificado</strong> físico + online",
          "<strong>PDV integrado</strong> com emissão de notas",
          "<strong>Painel multicanal</strong> centralizado"
        ],
        result: "João eliminou completamente as divergências de estoque e aumentou a confiança dos clientes na disponibilidade dos produtos.",
        image: "/src/assets/joao-persona.jpg"
      }
    ],
    features: [
      {
        id: 1,
        title: "Emissão Fiscal Completa",
        description: "NFe, NFSe, NFCe automatizadas",
        icon: "FileText"
      },
      {
        id: 2,
        title: "Controle de Estoque Inteligente",
        description: "Automação e relatórios em tempo real",
        icon: "Package"
      },
      {
        id: 3,
        title: "Dashboard Financeiro",
        description: "DRE completa e controle de fluxo",
        icon: "DollarSign"
      },
      {
        id: 4,
        title: "PDV Integrado",
        description: "Vendas rápidas com emissão automática",
        icon: "ShoppingCart"
      }
    ],
    pricing_plans: [
      {
        id: 1,
        name: "Starter",
        price: 49,
        description: "Para pequenos negócios",
        features: ["Até 3 usuários", "NFe ilimitadas", "Estoque básico"]
      },
      {
        id: 2,
        name: "Professional",
        price: 99,
        description: "Para empresas em crescimento",
        features: ["Até 10 usuários", "Todas as funcionalidades", "Integrações"]
      },
      {
        id: 3,
        name: "Enterprise",
        price: 199,
        description: "Para grandes operações",
        features: ["Usuários ilimitados", "Suporte prioritário", "Customizações"]
      }
    ],
    is_active: true,
  };
}