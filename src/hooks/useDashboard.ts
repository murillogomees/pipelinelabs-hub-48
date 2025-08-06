
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

export interface Widget {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  data: any[];
}

export const WIDGET_TYPES: Record<string, any> = {
  sales_monthly: {
    title: 'Vendas do Mês',
    defaultSize: { w: 4, h: 2 }
  },
  low_stock: {
    title: 'Estoque Baixo',
    defaultSize: { w: 4, h: 2 }
  },
  quick_actions: {
    title: 'Ações Rápidas',
    defaultSize: { w: 4, h: 2 }
  },
  pending_orders: {
    title: 'Pedidos Pendentes',
    defaultSize: { w: 4, h: 2 }
  }
};

export const useDashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Mock dashboard data
      return {
        sales: [],
        products: [],
        customers: [],
        orders: []
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  return {
    dashboardData,
    isLoading
  };
};

export const useUpdateDashboard = () => {
  const addWidget = (widgetType: string) => {
    console.log('Adding widget:', widgetType);
  };

  const removeWidget = (widgetId: string) => {
    console.log('Removing widget:', widgetId);
  };

  return {
    addWidget,
    removeWidget
  };
};
