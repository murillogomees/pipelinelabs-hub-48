
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface LandingPageSection {
  id: string;
  section_key: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  button_text?: string;
  content_data: any;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Dados estáticos das personas para garantir que sempre sejam exibidas
const defaultPersonasData = [
  {
    name: "Ana Costa",
    age: 34,
    location: "São Paulo, SP",
    business: "Loja de roupas femininas",
    image: "/placeholder.svg",
    problems: [
      "Controle de estoque desorganizado em planilhas",
      "Perda de vendas por falta de produtos",
      "Dificuldade para emitir notas fiscais",
      "Não sabe qual produto vende mais"
    ],
    solutions: [
      "Estoque automatizado com alertas",
      "Emissão de NFe integrada",
      "Relatórios de vendas detalhados",
      "Dashboard com métricas em tempo real"
    ],
    result: "Aumentou as vendas em 35% e reduziu o tempo de gestão em 60% com automação completa do estoque e vendas."
  },
  {
    name: "Lucas Silva",
    age: 28,
    location: "Rio de Janeiro, RJ",
    business: "Vendedor em marketplaces",
    image: "/placeholder.svg",
    problems: [
      "Gestão manual de múltiplos canais",
      "Controle de estoque descentralizado",
      "Dificuldade para precificar produtos",
      "Perda de pedidos por desorganização"
    ],
    solutions: [
      "Integração com Mercado Livre e outros",
      "Estoque unificado multicanal",
      "Sistema de precificação inteligente",
      "Central de pedidos automatizada"
    ],
    result: "Triplicou as vendas online e automatizou 80% dos processos com gestão multicanal integrada."
  },
  {
    name: "Carla Santos",
    age: 41,
    location: "Belo Horizonte, MG",
    business: "Pequena fábrica de salgados",
    image: "/placeholder.svg",
    problems: [
      "Controle de produção manual",
      "Dificuldade no controle financeiro",
      "Falta de visibilidade dos custos",
      "Gestão de pedidos desorganizada"
    ],
    solutions: [
      "Ordens de produção automatizadas",
      "Dashboard financeiro completo",
      "Controle de custos detalhado",
      "Sistema de pedidos integrado"
    ],
    result: "Organizou completamente a produção e aumentou a margem de lucro em 45% com controle financeiro preciso."
  },
  {
    name: "Eduardo Martins",
    age: 38,
    location: "Curitiba, PR",
    business: "Distribuidor de bebidas",
    image: "/placeholder.svg",
    problems: [
      "Logística complexa e manual",
      "Controle de estoque em múltiplos depósitos",
      "Pedidos grandes com muitos erros",
      "Dificuldade no controle de entregas"
    ],
    solutions: [
      "Sistema de separação inteligente",
      "Controle multi-depósito",
      "Etiquetas e código de barras",
      "Integração com transportadoras"
    ],
    result: "Reduziu erros de entrega em 90% e otimizou a logística com sistema automatizado de distribuição."
  },
  {
    name: "Patrícia Lima",
    age: 32,
    location: "Fortaleza, CE",
    business: "Prestadora de serviços",
    image: "/placeholder.svg",
    problems: [
      "Emissão manual de NFSe",
      "Controle financeiro precário",
      "Dificuldade para acompanhar recebimentos",
      "Gestão de clientes desorganizada"
    ],
    solutions: [
      "NFSe automática integrada",
      "Dashboard financeiro",
      "Controle de recebimentos",
      "CRM para gestão de clientes"
    ],
    result: "Automatizou 100% da emissão fiscal e melhorou o controle financeiro, aumentando a produtividade em 50%."
  },
  {
    name: "João Santos",
    age: 45,
    location: "Porto Alegre, RS",
    business: "Comércio atacadista",
    image: "/placeholder.svg",
    problems: [
      "Volume alto de pedidos manuais",
      "Controle de crédito inadequado",
      "Dificuldade na gestão de representantes",
      "Relatórios financeiros demorados"
    ],
    solutions: [
      "Automatização de pedidos",
      "Sistema de crédito integrado",
      "Portal para representantes",
      "Relatórios automáticos"
    ],
    result: "Aumentou a capacidade de vendas em 200% e reduziu inadimplência em 60% com controle de crédito automatizado."
  }
];

export function useLandingPageContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data with personas always available
  const { data: sections, isLoading } = useQuery({
    queryKey: ['landing-page-content'],
    queryFn: async (): Promise<LandingPageSection[]> => {
      // Mock landing page sections with personas section always included
      return [
        {
          id: '1',
          section_key: 'hero',
          title: 'Pipeline Labs',
          subtitle: 'Sistema completo de gestão',
          description: 'ERP inteligente para pequenos empreendedores',
          image_url: null,
          link_url: null,
          button_text: 'Começar agora',
          content_data: {},
          is_active: true,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          section_key: 'personas',
          title: 'Conheça quem já transformou seu negócio',
          subtitle: 'Histórias reais de empreendedores que superaram seus desafios',
          description: 'Casos de sucesso comprovados',
          image_url: null,
          link_url: null,
          button_text: null,
          content_data: {
            personas: defaultPersonasData
          },
          is_active: true,
          display_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LandingPageSection> }) => {
      // Mock update
      console.log('Updating landing page section:', id, updates);
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-content'] });
      toast({
        title: "Seção atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating landing page content:', error);
      toast({
        title: "Erro ao salvar",
        description: "Houve um erro ao salvar as alterações.",
        variant: "destructive",
      });
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: async (newSection: Omit<LandingPageSection, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock create
      console.log('Creating landing page section:', newSection);
      return {
        id: 'new_section_id',
        ...newSection,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-content'] });
      toast({
        title: "Seção criada",
        description: "Nova seção adicionada com sucesso.",
      });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock delete
      console.log('Deleting landing page section:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-content'] });
      toast({
        title: "Seção removida",
        description: "Seção removida com sucesso.",
      });
    },
  });

  // Helper function to get a specific section by key
  const getSection = (key: string): LandingPageSection | undefined => {
    const section = sections?.find(section => section.section_key === key);
    
    // Special handling for personas section to ensure it always returns data
    if (key === 'personas' && !section) {
      return {
        id: 'personas-fallback',
        section_key: 'personas',
        title: 'Conheça quem já transformou seu negócio',
        subtitle: 'Histórias reais de empreendedores que superaram seus desafios',
        description: 'Casos de sucesso comprovados',
        image_url: null,
        link_url: null,
        button_text: null,
        content_data: {
          personas: defaultPersonasData
        },
        is_active: true,
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    return section;
  };

  return {
    sections: sections || [],
    isLoading,
    updateSection: updateSectionMutation.mutate,
    createSection: createSectionMutation.mutate,
    deleteSection: deleteSectionMutation.mutate,
    isUpdating: updateSectionMutation.isPending,
    isCreating: createSectionMutation.isPending,
    isDeleting: deleteSectionMutation.isPending,
    getSection,
  };
}
