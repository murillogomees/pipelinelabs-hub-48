
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useRedisCache } from './useRedisCache';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useOptimizedQuery');

interface OptimizedQueryOptions<T> {
  queryKey: (string | number)[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  useRedis?: boolean;
  redisTTL?: number;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  enabled = true,
  useRedis = true,
  redisTTL = 300 // 5 minutes in seconds
}: OptimizedQueryOptions<T>) {
  const queryClient = useQueryClient();
  const redis = useRedisCache();

  const redisKey = useMemo(() => 
    queryKey.join(':'), [queryKey]
  );

  const optimizedQueryFn = useCallback(async (): Promise<T> => {
    if (useRedis) {
      // Try Redis first
      const cachedData = await redis.get<T>(redisKey);
      if (cachedData) {
        logger.debug(`Redis cache hit for ${redisKey}`);
        return cachedData;
      }
    }

    // Fetch from source
    logger.debug(`Fetching fresh data for ${redisKey}`);
    const data = await queryFn();

    // Cache in Redis
    if (useRedis && data) {
      await redis.set(redisKey, data, { ttl: redisTTL });
    }

    return data;
  }, [queryFn, redisKey, useRedis, redisTTL, redis]);

  const query = useQuery({
    queryKey,
    queryFn: optimizedQueryFn,
    staleTime,
    gcTime: cacheTime,
    enabled,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const invalidateCache = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
    if (useRedis) {
      await redis.invalidate(redisKey);
    }
  }, [queryClient, queryKey, redis, redisKey, useRedis]);

  const prefetch = useCallback(async () => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: optimizedQueryFn,
      staleTime,
    });
  }, [queryClient, queryKey, optimizedQueryFn, staleTime]);

  return {
    ...query,
    invalidateCache,
    prefetch
  };
}
