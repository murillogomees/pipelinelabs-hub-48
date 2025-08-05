
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/**
 * Hook otimizado para performance - configurações globais
 */
export function usePerformanceOptimized() {
  const queryClient = useQueryClient();

  // Configurações otimizadas padrão
  const optimizedDefaults = useMemo(() => ({
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }), []);

  // Invalidação inteligente de cache
  const invalidateByPattern = useCallback(async (patterns: string[]) => {
    await Promise.all(
      patterns.map(pattern => 
        queryClient.invalidateQueries({
          predicate: (query) => 
            query.queryKey.some(key => 
              typeof key === 'string' && key.includes(pattern)
            )
        })
      )
    );
  }, [queryClient]);

  // Cache warming para dados críticos
  const warmupCache = useCallback(async (companyId: string) => {
    const warmupQueries = [
      ['companies', companyId],
      ['profiles', 'current'],
      ['access_levels', 'active'],
    ];

    await Promise.all(
      warmupQueries.map(queryKey =>
        queryClient.prefetchQuery({
          queryKey,
          staleTime: optimizedDefaults.staleTime,
        })
      )
    );
  }, [queryClient, optimizedDefaults.staleTime]);

  return {
    optimizedDefaults,
    invalidateByPattern,
    warmupCache,
  };
}

/**
 * Hook para monitoramento de performance em tempo real
 */
export function usePerformanceMonitor() {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['performance-monitor'],
    queryFn: async () => {
      // Métricas de performance do React Query
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.getAll();
      
      const queryMetrics = queries.slice(0, 10).map(query => ({
        queryKey: query.queryKey,
        state: query.state.status,
        dataUpdatedAt: query.state.dataUpdatedAt,
        errorUpdatedAt: query.state.errorUpdatedAt,
      }));

      // Métricas de navegador
      const performanceEntries = performance.getEntriesByType('navigation');
      const timing = performanceEntries[0] as PerformanceNavigationTiming;

      return {
        queryCache: queryMetrics,
        timing: {
          domContentLoaded: timing ? timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart : 0,
          loadComplete: timing ? timing.loadEventEnd - timing.loadEventStart : 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        },
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        } : null,
      };
    },
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // 1 minuto
    enabled: process.env.NODE_ENV === 'development',
  });
}
