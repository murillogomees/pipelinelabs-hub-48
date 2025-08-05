
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

export interface Widget {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  data?: any;
}

export interface WidgetType {
  id: string;
  title: string;
  icon: string;
  category: string;
  defaultSize: { w: number; h: number };
}

export const WIDGET_TYPES: Record<string, WidgetType> = {
  sales_overview: {
    id: 'sales_overview',
    title: 'Visão Geral de Vendas',
    icon: 'DollarSign',
    category: 'sales',
    defaultSize: { w: 4, h: 2 }
  },
  products_stock: {
    id: 'products_stock',
    title: 'Estoque de Produtos',
    icon: 'Package',
    category: 'inventory',
    defaultSize: { w: 4, h: 2 }
  },
  customers_overview: {
    id: 'customers_overview',
    title: 'Visão Geral de Clientes',
    icon: 'ShoppingCart',
    category: 'sales',
    defaultSize: { w: 4, h: 2 }
  },
  financial_summary: {
    id: 'financial_summary',
    title: 'Resumo Financeiro',
    icon: 'CreditCard',
    category: 'financial',
    defaultSize: { w: 4, h: 2 }
  },
  invoice_status: {
    id: 'invoice_status',
    title: 'Status das Notas Fiscais',
    icon: 'Receipt',
    category: 'fiscal',
    defaultSize: { w: 4, h: 2 }
  },
  quick_actions: {
    id: 'quick_actions',
    title: 'Ações Rápidas',
    icon: 'Zap',
    category: 'actions',
    defaultSize: { w: 4, h: 2 }
  }
};

export function useDashboard() {
  const { currentCompanyId } = usePermissions();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return null;

      // Fetch dashboard data for the current company
      const [salesData, productsData, customersData] = await Promise.all([
        supabase
          .from('sales')
          .select('*')
          .eq('company_id', currentCompanyId),
        supabase
          .from('products')
          .select('*')
          .eq('company_id', currentCompanyId),
        supabase
          .from('customers')
          .select('*')
          .eq('company_id', currentCompanyId)
      ]);

      return {
        sales: salesData.data || [],
        products: productsData.data || [],
        customers: customersData.data || []
      };
    },
    enabled: !!currentCompanyId,
    staleTime: 1000 * 60 * 5, // 5 minutos em vez de tempo padrão
    gcTime: 1000 * 60 * 15, // 15 minutos de cache
    refetchInterval: 1000 * 60 * 5, // 5 minutos em vez de 30 segundos
    refetchOnWindowFocus: false, // Não refetch ao focar janela
  });

  return {
    dashboardData,
    isLoading,
    data: dashboardData // Adding data property for compatibility
  };
}

// Mock function for useUpdateDashboard
export function useUpdateDashboard() {
  return {
    updateWidget: (widgetId: string, data: any) => {
      console.log('Updating widget:', widgetId, data);
    },
    addWidget: (widgetType: string) => {
      console.log('Adding widget:', widgetType);
    },
    removeWidget: (widgetId: string) => {
      console.log('Removing widget:', widgetId);
    }
  };
}
