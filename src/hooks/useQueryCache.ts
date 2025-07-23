import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Hook para gerenciar cache de queries de forma inteligente
export function useQueryCache() {
  const queryClient = useQueryClient();

  // Invalidar cache relacionado a uma entidade específica
  const invalidateEntityCache = useCallback((entity: string, entityId?: string) => {
    const patterns = [
      [entity],
      ['dashboard-data'],
      ['reports'],
      ['global-search']
    ];

    if (entityId) {
      patterns.push([entity, entityId]);
    }

    patterns.forEach(pattern => {
      queryClient.invalidateQueries({ queryKey: pattern });
    });
  }, [queryClient]);

  // Pre-carregar dados críticos
  const prefetchCriticalData = useCallback(async () => {
    const prefetchPromises = [
      // Dashboard data
      queryClient.prefetchQuery({
        queryKey: ['dashboard-data'],
        staleTime: 60000,
      }),

      // Produtos ativos (para PDV)
      queryClient.prefetchQuery({
        queryKey: ['products', 'active'],
        queryFn: async () => {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data } = await supabase
            .from('products')
            .select('id, name, code, price, stock_quantity')
            .eq('is_active', true)
            .order('name');
          return data;
        },
        staleTime: 300000, // 5 minutos
      }),

      // Clientes ativos (para vendas)
      queryClient.prefetchQuery({
        queryKey: ['customers', 'active'],
        queryFn: async () => {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data } = await supabase
            .from('customers')
            .select('id, name, document, email')
            .eq('is_active', true)
            .order('name')
            .limit(100);
          return data;
        },
        staleTime: 300000, // 5 minutos
      })
    ];

    await Promise.allSettled(prefetchPromises);
  }, [queryClient]);

  // Limpar cache antigo
  const clearStaleCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  // Otimizar cache baseado na rota atual
  const optimizeCacheForRoute = useCallback((route: string) => {
    switch (route) {
      case '/dashboard':
        queryClient.prefetchQuery({
          queryKey: ['dashboard-data'],
          staleTime: 60000,
        });
        break;

      case '/vendas':
        queryClient.prefetchQuery({
          queryKey: ['sales', { status: 'pending', page: 1, pageSize: 50 }],
          staleTime: 30000,
        });
        break;

      case '/produtos':
        queryClient.prefetchQuery({
          queryKey: ['products', 'optimized-list'],
          staleTime: 60000,
        });
        break;

      case '/clientes':
        queryClient.prefetchQuery({
          queryKey: ['customers', 'optimized-list'],
          staleTime: 60000,
        });
        break;

      case '/pos':
        // Pre-carregar dados críticos para PDV
        queryClient.prefetchQuery({
          queryKey: ['products', 'pos-data'],
          staleTime: 300000,
        });
        break;
    }
  }, [queryClient]);

  return {
    invalidateEntityCache,
    prefetchCriticalData,
    clearStaleCache,
    optimizeCacheForRoute,
  };
}

// Hook para monitorar performance de queries
export function useQueryPerformance() {
  const queryClient = useQueryClient();

  const getSlowQueries = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return queries
      .filter(query => {
        const state = query.state;
        return state.fetchStatus === 'fetching' || 
               (state.dataUpdatedAt > 0 && state.dataUpdatedAt - state.fetchFailureCount > 1000);
      })
      .map(query => ({
        queryKey: query.queryKey,
        fetchStatus: query.state.fetchStatus,
        lastFetchTime: query.state.dataUpdatedAt,
        errorCount: query.state.fetchFailureCount
      }));
  }, [queryClient]);

  const logQueryMetrics = useCallback(() => {
    const slowQueries = getSlowQueries();
    if (slowQueries.length > 0) {
      console.warn('Queries lentas detectadas:', slowQueries);
    }
  }, [getSlowQueries]);

  return {
    getSlowQueries,
    logQueryMetrics,
  };
}