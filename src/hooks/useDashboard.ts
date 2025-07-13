import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Widget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config?: Record<string, any>;
}

export interface DashboardConfig {
  id?: string;
  user_id: string;
  company_id: string;
  widgets: Widget[];
  layout_config: Record<string, any>;
}

export function useDashboard() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_dashboards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (!data) return null;
      
      return {
        ...data,
        widgets: (data.widgets as any) || [],
        layout_config: (data.layout_config as any) || {},
      } as DashboardConfig;
    },
    enabled: !!user?.id,
  });
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (config: Partial<DashboardConfig>) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Buscar company_id se não foi fornecido
      let companyId = config.company_id;
      if (!companyId) {
        const { data: userCompany } = await supabase
          .from('user_companies')
          .select('company_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();
        
        companyId = userCompany?.company_id;
      }

      if (!companyId) {
        throw new Error('Nenhuma empresa encontrada para o usuário');
      }

      const { data, error } = await supabase
        .from('user_dashboards')
        .upsert({
          user_id: user.id,
          company_id: companyId,
          widgets: config.widgets || [] as any,
          layout_config: config.layout_config || {} as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Dashboard atualizado',
        description: 'Suas configurações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Widget types available based on user permissions and company modules
export const WIDGET_TYPES = {
  SALES_MONTHLY: {
    id: 'sales_monthly',
    title: 'Vendas do Mês',
    icon: 'DollarSign',
    category: 'financial',
    defaultSize: { w: 2, h: 2 },
  },
  PENDING_ORDERS: {
    id: 'pending_orders',
    title: 'Pedidos Pendentes',
    icon: 'ShoppingCart',
    category: 'sales',
    defaultSize: { w: 2, h: 2 },
  },
  LOW_STOCK: {
    id: 'low_stock',
    title: 'Estoque Baixo',
    icon: 'Package',
    category: 'inventory',
    defaultSize: { w: 2, h: 2 },
  },
  ACCOUNTS_RECEIVABLE: {
    id: 'accounts_receivable',
    title: 'Contas a Receber',
    icon: 'FileText',
    category: 'financial',
    defaultSize: { w: 2, h: 2 },
  },
  ACCOUNTS_PAYABLE: {
    id: 'accounts_payable',
    title: 'Contas a Pagar',
    icon: 'CreditCard',
    category: 'financial',
    defaultSize: { w: 2, h: 2 },
  },
  INVOICES_ISSUED: {
    id: 'invoices_issued',
    title: 'Notas Fiscais',
    icon: 'Receipt',
    category: 'fiscal',
    defaultSize: { w: 2, h: 2 },
  },
  PROPOSALS_PENDING: {
    id: 'proposals_pending',
    title: 'Propostas Pendentes',
    icon: 'FileCheck',
    category: 'sales',
    defaultSize: { w: 2, h: 2 },
  },
  SALES_CHART: {
    id: 'sales_chart',
    title: 'Gráfico de Vendas',
    icon: 'TrendingUp',
    category: 'analytics',
    defaultSize: { w: 4, h: 3 },
  },
  TOP_PRODUCTS: {
    id: 'top_products',
    title: 'Produtos Mais Vendidos',
    icon: 'Award',
    category: 'analytics',
    defaultSize: { w: 3, h: 3 },
  },
  QUICK_ACTIONS: {
    id: 'quick_actions',
    title: 'Ações Rápidas',
    icon: 'Zap',
    category: 'actions',
    defaultSize: { w: 2, h: 3 },
  },
} as const;