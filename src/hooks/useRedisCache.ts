import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('RedisCache');

interface CacheRequest {
  action: 'get' | 'set' | 'delete' | 'invalidate' | 'stats' | 'flush';
  key?: string;
  value?: any;
  ttl?: number;
  pattern?: string;
}

interface CacheResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export function useRedisCache() {
  const callCacheFunction = useCallback(async (request: CacheRequest): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: request
      });

      if (error) {
        logger.error('Cache function error:', error);
        throw new Error(error.message || 'Cache operation failed');
      }

      const response = data as CacheResponse;
      
      if (!response.success) {
        throw new Error(response.error || 'Cache operation failed');
      }

      return response.data;
    } catch (error) {
      logger.error('Redis cache error:', error);
      // Em caso de erro, retornar null para fallback
      return null;
    }
  }, []);

  const get = useCallback(async <T>(key: string): Promise<T | null> => {
    return await callCacheFunction({ action: 'get', key });
  }, [callCacheFunction]);

  const set = useCallback(async <T>(key: string, value: T, ttl?: number): Promise<boolean> => {
    try {
      await callCacheFunction({ action: 'set', key, value, ttl });
      return true;
    } catch (error) {
      return false;
    }
  }, [callCacheFunction]);

  const remove = useCallback(async (key: string): Promise<boolean> => {
    try {
      await callCacheFunction({ action: 'delete', key });
      return true;
    } catch (error) {
      return false;
    }
  }, [callCacheFunction]);

  const invalidatePattern = useCallback(async (pattern: string): Promise<number> => {
    try {
      const result = await callCacheFunction({ action: 'invalidate', pattern });
      return result?.deleted || 0;
    } catch (error) {
      return 0;
    }
  }, [callCacheFunction]);

  const getStats = useCallback(async () => {
    return await callCacheFunction({ action: 'stats' });
  }, [callCacheFunction]);

  const flush = useCallback(async (): Promise<boolean> => {
    try {
      await callCacheFunction({ action: 'flush' });
      return true;
    } catch (error) {
      return false;
    }
  }, [callCacheFunction]);

  return {
    get,
    set,
    remove,
    invalidatePattern,
    getStats,
    flush
  };
}

// Hook para cache com React Query integrado
export function useRedisCacheWithQuery<T>({
  key,
  fetcher,
  ttl = 300,
  enabled = true
}: {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
}) {
  const redisCache = useRedisCache();

  const getCachedData = useCallback(async (): Promise<T> => {
    if (!enabled) {
      return await fetcher();
    }

    try {
      // Tentar buscar do Redis primeiro
      const cachedData = await redisCache.get<T>(key);
      
      if (cachedData !== null) {
        logger.debug(`Redis cache hit: ${key}`);
        return cachedData;
      }

      // Se não encontrou no cache, buscar dados frescos
      logger.debug(`Redis cache miss: ${key}`);
      const freshData = await fetcher();
      
      // Salvar no cache para próximas requisições
      await redisCache.set(key, freshData, ttl);
      
      return freshData;
    } catch (error) {
      logger.warn(`Redis cache error for ${key}, falling back to direct fetch:`, error);
      return await fetcher();
    }
  }, [key, fetcher, ttl, enabled, redisCache]);

  const invalidate = useCallback(async () => {
    await redisCache.remove(key);
  }, [key, redisCache]);

  const invalidatePattern = useCallback(async (pattern: string) => {
    return await redisCache.invalidatePattern(pattern);
  }, [redisCache]);

  return {
    getCachedData,
    invalidate,
    invalidatePattern,
    redisCache
  };
}