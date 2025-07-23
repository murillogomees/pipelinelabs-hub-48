import React from 'react';
import { useRedisCacheWithQuery } from '@/hooks/useRedisCache';
import { useUserCompany } from '@/hooks/useUserCompany';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  lowStockProducts: number;
  totalCustomers: number;
  monthlyRevenue: number;
}

export function CachedDashboardData() {
  const { data: companyId } = useUserCompany();

  const { getCachedData, invalidate } = useRedisCacheWithQuery<DashboardStats>({
    key: `dashboard:stats:${companyId}`,
    fetcher: async () => {
      if (!companyId) throw new Error('Company not found');

      // Simular busca de dados do dashboard
      const [salesResult, ordersResult, productsResult, customersResult] = await Promise.all([
        supabase
          .from('sales')
          .select('total_amount')
          .eq('company_id', companyId),
        supabase
          .from('sales')
          .select('id')
          .eq('company_id', companyId)
          .eq('status', 'pending'),
        supabase
          .from('products')
          .select('id')
          .eq('company_id', companyId)
          .lt('stock_quantity', 10),
        supabase
          .from('customers')
          .select('id')
          .eq('company_id', companyId)
      ]);

      const totalSales = salesResult.data?.length || 0;
      const totalOrders = ordersResult.data?.length || 0;
      const lowStockProducts = productsResult.data?.length || 0;
      const totalCustomers = customersResult.data?.length || 0;
      const monthlyRevenue = salesResult.data?.reduce((sum, sale) => 
        sum + (sale.total_amount || 0), 0) || 0;

      return {
        totalSales,
        totalOrders,
        lowStockProducts,
        totalCustomers,
        monthlyRevenue
      };
    },
    ttl: 300, // 5 minutos
    enabled: !!companyId
  });

  const [data, setData] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCachedData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [getCachedData, companyId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    await invalidate();
    await loadData();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadData}
            className="ml-2"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard Stats (Cached)</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Cache
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-blue-50">
          <p className="text-sm text-muted-foreground">Total de Vendas</p>
          <p className="text-2xl font-bold text-blue-600">{data.totalSales}</p>
        </div>
        
        <div className="p-4 border rounded-lg bg-orange-50">
          <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
          <p className="text-2xl font-bold text-orange-600">{data.totalOrders}</p>
        </div>
        
        <div className="p-4 border rounded-lg bg-red-50">
          <p className="text-sm text-muted-foreground">Estoque Baixo</p>
          <p className="text-2xl font-bold text-red-600">{data.lowStockProducts}</p>
        </div>
        
        <div className="p-4 border rounded-lg bg-green-50">
          <p className="text-sm text-muted-foreground">Total Clientes</p>
          <p className="text-2xl font-bold text-green-600">{data.totalCustomers}</p>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg bg-purple-50">
        <p className="text-sm text-muted-foreground">Receita Mensal</p>
        <p className="text-2xl font-bold text-purple-600">
          R$ {data.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}