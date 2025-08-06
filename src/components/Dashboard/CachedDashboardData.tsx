
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface CachedDashboardDataProps {
  children: (data: any) => React.ReactNode;
}

export const CachedDashboardData: React.FC<CachedDashboardDataProps> = ({ children }) => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Mock dashboard data for now
      return {
        sales: { count: 0, total: 0 },
        customers: { count: 0 },
        products: { count: 0 },
        invoices: { count: 0 }
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
  });

  if (isLoading) {
    return <div>Carregando dados do dashboard...</div>;
  }

  return <>{children(dashboardData)}</>;
};
