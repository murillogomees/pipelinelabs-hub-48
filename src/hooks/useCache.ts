import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cacheManager, generateCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createLogger } from '@/utils/logger';

const cacheLogger = createLogger('useCache');

interface UseCacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
  staleTime?: number;
  refetchOnMount?: boolean;
  onError?: (error: Error) => void;
}

export function useCache<T>({
  key,
  fetcher,
  ttl = CACHE_TTL.DEFAULT,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutos
  refetchOnMount = false,
  onError
}: UseCacheOptions<T>) {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: [key],
    queryFn: async (): Promise<T> => {
      try {
        // Primeiro, tenta buscar no cache
        const cachedData = await cacheManager.get<T>(key);
        if (cachedData) {
          return cachedData;
        }
        
        // Se não encontrar no cache, busca do banco
        cacheLogger.debug(`Cache miss para ${key}, buscando dados...`);
        const freshData = await fetcher();
        
        // Salva no cache
        await cacheManager.set(key, freshData, ttl);
        
        return freshData;
      } catch (error) {
        cacheLogger.error(`Erro ao buscar dados para ${key}:`, error);
        if (onError) {
          onError(error as Error);
        }
        throw error;
      }
    },
    enabled,
    staleTime,
    refetchOnMount,
    retry: 2,
    retryDelay: 1000,
  });
  
  const invalidateCache = useCallback(async () => {
    try {
      await cacheManager.invalidate(key);
      await queryClient.invalidateQueries({ queryKey: [key] });
      cacheLogger.debug(`Cache invalidado para ${key}`);
    } catch (error) {
      cacheLogger.error(`Erro ao invalidar cache para ${key}:`, error);
    }
  }, [key, queryClient]);
  
  const updateCache = useCallback(async (newData: T) => {
    try {
      await cacheManager.set(key, newData, ttl);
      queryClient.setQueryData([key], newData);
      cacheLogger.debug(`Cache atualizado para ${key}`);
    } catch (error) {
      cacheLogger.error(`Erro ao atualizar cache para ${key}:`, error);
    }
  }, [key, ttl, queryClient]);
  
  return {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
    invalidateCache,
    updateCache
  };
}

// Hook para cache específico da empresa
export function useCompanyCache<T>({
  companyId,
  cacheType,
  fetcher,
  ttl,
  enabled = true,
  staleTime,
  refetchOnMount,
  onError,
  ...additionalParams
}: {
  companyId: string;
  cacheType: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
  staleTime?: number;
  refetchOnMount?: boolean;
  onError?: (error: Error) => void;
} & Record<string, any>) {
  const key = generateCacheKey(cacheType, companyId, ...Object.values(additionalParams));
  
  return useCache({
    key,
    fetcher,
    ttl,
    enabled,
    staleTime,
    refetchOnMount,
    onError
  });
}

// Hook para gerenciar invalidação de cache por padrão
export function useCacheInvalidation() {
  const queryClient = useQueryClient();
  
  const invalidatePattern = useCallback(async (pattern: string) => {
    try {
      await cacheManager.invalidatePattern(pattern);
      // Invalidar queries relacionadas no React Query
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0] as string;
          return queryKey.includes(pattern.replace('*', ''));
        }
      });
      cacheLogger.debug(`Cache pattern invalidado: ${pattern}`);
    } catch (error) {
      cacheLogger.error(`Erro ao invalidar pattern ${pattern}:`, error);
    }
  }, [queryClient]);
  
  const invalidateCompanyCache = useCallback(async (companyId: string) => {
    await invalidatePattern(`*company:${companyId}*`);
  }, [invalidatePattern]);
  
  const flushAllCache = useCallback(async () => {
    try {
      await cacheManager.flush();
      await queryClient.clear();
      cacheLogger.info('Todo o cache foi limpo');
    } catch (error) {
      cacheLogger.error('Erro ao limpar todo o cache:', error);
    }
  }, [queryClient]);
  
  return {
    invalidatePattern,
    invalidateCompanyCache,
    flushAllCache
  };
}

// Hook para estatísticas do cache (admin)
export function useCacheStats() {
  const [stats, setStats] = useState<{
    keys: string[];
    redisAvailable: boolean;
    fallbackSize: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const refreshStats = useCallback(async () => {
    setLoading(true);
    try {
      const cacheStats = await cacheManager.getStats();
      setStats(cacheStats);
    } catch (error) {
      cacheLogger.error('Erro ao obter estatísticas do cache:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);
  
  return {
    stats,
    loading,
    refreshStats
  };
}