import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRedisCache } from './useRedisCache';

export function useIntelligentCache() {
  const queryClient = useQueryClient();
  const redisCache = useRedisCache();

  const invalidateByPattern = useCallback(async (pattern: string) => {
    // Invalidar Redis
    await redisCache.invalidatePattern(pattern);
    
    // Invalidar React Query
    await queryClient.invalidateQueries({
      predicate: (query) => {
        const key = Array.isArray(query.queryKey) ? query.queryKey.join('-') : String(query.queryKey);
        return key.includes(pattern);
      }
    });
  }, [redisCache, queryClient]);

  const clearCompanyCache = useCallback(async (companyId: string) => {
    await Promise.all([
      invalidateByPattern(`company-${companyId}`),
      invalidateByPattern(`customers-${companyId}`),
      invalidateByPattern(`products-${companyId}`),
      invalidateByPattern(`sales-${companyId}`)
    ]);
  }, [invalidateByPattern]);

  return {
    invalidateByPattern,
    clearCompanyCache,
    flushAll: redisCache.flush,
    getStats: redisCache.getStats
  };
}