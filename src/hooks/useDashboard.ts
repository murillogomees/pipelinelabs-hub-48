
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

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
    enabled: !!currentCompanyId
  });

  return {
    dashboardData,
    isLoading
  };
}
