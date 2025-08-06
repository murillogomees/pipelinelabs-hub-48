import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

// Interface unificada para cache global
interface GlobalCacheConfig {
  // Configurações otimizadas por tipo de dados
  dashboard: {
    staleTime: number;
    gcTime: number;
    refetchInterval: number;
  };
  catalog: {
    staleTime: number;
    gcTime: number;
    refetchInterval: false;
  };
  userdata: {
    staleTime: number;
    gcTime: number;
    refetchInterval: false;
  };
  analytics: {
    staleTime: number;
    gcTime: number;
    refetchInterval: number;
  };
}

// Configurações otimizadas globais
const GLOBAL_CACHE_CONFIG: GlobalCacheConfig = {
  dashboard: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15, // 15 minutos
    refetchInterval: 1000 * 60 * 5, // 5 minutos
  },
  catalog: {
    staleTime: 1000 * 60 * 30, // 30 minutos (dados estáticos)
    gcTime: 1000 * 60 * 60, // 1 hora
    refetchInterval: false, // Não atualiza automaticamente
  },
  userdata: {
    staleTime: 1000 * 60 * 15, // 15 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchInterval: false, // Atualiza só quando necessário
  },
  analytics: {
    staleTime: 1000 * 60 * 2, // 2 minutos (dados mais dinâmicos)
    gcTime: 1000 * 60 * 10, // 10 minutos
    refetchInterval: 1000 * 60 * 2, // 2 minutos
  },
};

/**
 * Hook principal para cache global unificado
 */
export function useGlobalCache() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentCompanyId, isSuperAdmin } = usePermissions();

  // Chave de cache inteligente
  const getCacheKey = useCallback((
    type: keyof GlobalCacheConfig,
    resource: string,
    params?: Record<string, any>
  ) => {
    const baseKey = [type, resource];
    
    if (currentCompanyId && type !== 'catalog') {
      baseKey.push(currentCompanyId);
    }
    
    if (params) {
      baseKey.push(JSON.stringify(params));
    }
    
    return baseKey;
  }, [currentCompanyId]);

  // Configuração dinâmica por tipo
  const getConfig = useCallback((type: keyof GlobalCacheConfig) => ({
    ...GLOBAL_CACHE_CONFIG[type],
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }), []);

  // Query unificada com lazy loading
  const useGlobalQuery = useCallback(<T>(
    type: keyof GlobalCacheConfig,
    resource: string,
    fetcher: () => Promise<T>,
    options?: {
      enabled?: boolean;
      params?: Record<string, any>;
    }
  ) => {
    const { enabled = true, params } = options || {};
    
    return useQuery({
      queryKey: getCacheKey(type, resource, params),
      queryFn: fetcher,
      enabled: enabled && !!user,
      ...getConfig(type),
    });
  }, [getCacheKey, getConfig, user]);

  // Invalidação inteligente por padrões
  const invalidateByPattern = useCallback(async (patterns: string[]) => {
    const promises = patterns.map(pattern =>
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey.some(key => 
            typeof key === 'string' && key.includes(pattern)
          )
      })
    );
    
    await Promise.all(promises);
  }, [queryClient]);

  // Cache warming para dados críticos
  const warmupCriticalData = useCallback(async () => {
    if (!currentCompanyId) return;

    const criticalQueries = [
      // Dados do usuário
      ['userdata', 'profile'],
      ['userdata', 'permissions'],
      // Dados da empresa
      ['userdata', 'company'],
      // Catálogo básico
      ['catalog', 'access_levels'],
    ];

    await Promise.all(
      criticalQueries.map(([type, resource]) =>
        queryClient.prefetchQuery({
          queryKey: getCacheKey(type as keyof GlobalCacheConfig, resource),
          staleTime: getConfig(type as keyof GlobalCacheConfig).staleTime,
        })
      )
    );
  }, [currentCompanyId, queryClient, getCacheKey, getConfig]);

  // Limpeza de cache por empresa
  const clearCompanyCache = useCallback(async (companyId?: string) => {
    const targetCompany = companyId || currentCompanyId;
    if (!targetCompany) return;

    await queryClient.invalidateQueries({
      predicate: (query) => 
        query.queryKey.includes(targetCompany)
    });
  }, [queryClient, currentCompanyId]);

  return {
    useGlobalQuery,
    invalidateByPattern,
    warmupCriticalData,
    clearCompanyCache,
    config: GLOBAL_CACHE_CONFIG,
  };
}

/**
 * Hook para dashboard unificado (substitui useCachedDashboard)
 */
export function useUnifiedDashboard() {
  const { useGlobalQuery } = useGlobalCache();
  const { currentCompanyId } = usePermissions();

  return useGlobalQuery(
    'dashboard',
    'summary',
    async () => {
      if (!currentCompanyId) throw new Error('No company selected');

      // Queries otimizadas usando os novos índices
      const [salesData, productsData, customersData, financialData] = await Promise.all([
        supabase
          .from('sales')
          .select('total_amount, status, created_at')
          .eq('company_id', currentCompanyId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false }),
        
        supabase
          .from('products')
          .select('name, stock_quantity, min_stock')
          .eq('company_id', currentCompanyId)
          .eq('is_active', true)
          .order('stock_quantity', { ascending: true })
          .limit(10),
        
        supabase
          .from('customers')
          .select('name, created_at')
          .eq('company_id', currentCompanyId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5),
        
        supabase
          .from('accounts_receivable')
          .select('amount, due_date, status')
          .eq('company_id', currentCompanyId)
          .eq('status', 'pending')
          .order('due_date', { ascending: true })
      ]);

      return {
        sales: {
          total: salesData.data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0,
          count: salesData.data?.length || 0,
          recent: salesData.data?.slice(0, 5) || [],
        },
        products: {
          lowStock: productsData.data || [],
          total: productsData.data?.length || 0,
        },
        customers: {
          recent: customersData.data || [],
          total: customersData.data?.length || 0,
        },
        financial: {
          pending: financialData.data?.reduce((sum, acc) => sum + Number(acc.amount), 0) || 0,
          overdue: financialData.data?.filter(acc => new Date(acc.due_date) < new Date()).length || 0,
        },
      };
    },
    { 
      enabled: !!currentCompanyId
    }
  );
}

/**
 * Hook para catálogo unificado (substitui múltiplos hooks de catalog)
 */
export function useUnifiedCatalog<T = any>(resource: string, fetcher: () => Promise<T>) {
  const { useGlobalQuery } = useGlobalCache();

  return useGlobalQuery(
    'catalog',
    resource,
    fetcher,
    { enabled: true }
  );
}

/**
 * Hook para lazy loading com intersection observer
 */
export function useLazyQuery<T>(
  type: keyof GlobalCacheConfig,
  resource: string,
  fetcher: () => Promise<T>,
  threshold = 0.1
) {
  const { useGlobalQuery } = useGlobalCache();
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<Element | null>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  const query = useGlobalQuery(
    type,
    resource,
    fetcher,
    { enabled: isVisible }
  );

  return {
    ...query,
    ref: setRef,
    isVisible,
  };
}

/**
 * Hook para realtime updates otimizado
 */
export function useRealtimeOptimized(
  table: string,
  filter?: { column: string; value: any }
) {
  const { invalidateByPattern } = useGlobalCache();
  const { currentCompanyId } = usePermissions();

  useEffect(() => {
    if (!currentCompanyId) return;

    const channel = supabase
      .channel(`realtime-${table}-${currentCompanyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        },
        () => {
          // Invalidação inteligente baseada na tabela
          invalidateByPattern([table, 'dashboard', 'analytics']);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, currentCompanyId, invalidateByPattern]);
}