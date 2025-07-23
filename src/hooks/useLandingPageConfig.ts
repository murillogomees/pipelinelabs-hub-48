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
        name: "Carla",
        age: 41,
        business: "Fábrica de salgados artesanais",
        location: "Belo Horizonte/MG",
        situation: "Mãe solo de 2 filhos, empreende há 5 anos",
        problems: [
          "Não sabia se o negócio realmente dava lucro",
          "Perdia 2 horas por dia organizando planilhas", 
          "Emitir notas fiscais era um pesadelo",
          "Controle de estoque em cadernos"
        ],
        solutions: [
          "Dashboard financeiro mostra lucros em tempo real",
          "Notas fiscais emitidas em 3 cliques",
          "Controle automático de ingredientes e estoque",
          "Ordem de produção otimizada por demanda"
        ],
        result: "Conseguiu contratar 2 funcionários e dobrar sua produção, mantendo total controle financeiro e operacional.",
        image: "/src/assets/carla-persona.jpg"
      },
      {
        id: 2,
        name: "Lucas",
        age: 28,
        business: "Vendedor em marketplaces",
        problem: "Falta de controle multicanal",
        solution: "Centralização de pedidos e estoque",
        image: "/placeholder.svg"
      },
      {
        id: 3,
        name: "Carla",
        age: 41,
        business: "Pequena fábrica de salgados",
        problem: "Falta de visibilidade financeira",
        solution: "Ordem de produção e dashboard financeiro",
        image: "/placeholder.svg"
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