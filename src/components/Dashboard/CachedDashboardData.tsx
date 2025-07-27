
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserCompany } from '@/hooks/useUserCompany';

interface CachedDashboardDataProps {
  children: (data: any) => React.ReactNode;
}

export const CachedDashboardData: React.FC<CachedDashboardDataProps> = ({ children }) => {
  const { userCompany } = useUserCompany();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-data', userCompany?.company_id],
    queryFn: async () => {
      if (!userCompany?.company_id) return null;

      // Mock dashboard data for now
      return {
        sales: { count: 0, total: 0 },
        customers: { count: 0 },
        products: { count: 0 },
        invoices: { count: 0 }
      };
    },
    enabled: !!userCompany?.company_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return <div>Carregando dados do dashboard...</div>;
  }

  return <>{children(dashboardData)}</>;
};
