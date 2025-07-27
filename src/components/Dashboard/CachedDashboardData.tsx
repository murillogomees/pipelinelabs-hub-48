
import { useDashboard } from '@/hooks/useDashboard';
import { useUserCompany } from '@/hooks/useUserCompany';

export const CachedDashboardData = () => {
  const { userCompany, isLoading: isLoadingCompany } = useUserCompany();
  const { dashboardData, isLoading: isLoadingDashboard } = useDashboard();

  if (isLoadingCompany || isLoadingDashboard) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userCompany) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma empresa encontrada para o usuário atual.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Empresa</h3>
          <p className="text-sm text-muted-foreground">{userCompany.company?.name}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Vendas</h3>
          <p className="text-sm text-muted-foreground">
            {dashboardData.sales?.length || 0} vendas
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Produtos</h3>
          <p className="text-sm text-muted-foreground">
            {dashboardData.products?.length || 0} produtos
          </p>
        </div>
      </div>
    </div>
  );
};
