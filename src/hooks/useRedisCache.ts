
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useRedisCache');

interface CacheOptions {
  ttl?: number;
  enabled?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  redisAvailable: boolean;
}

export function useRedisCache() {
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    size: 0,
    redisAvailable: false
  });

  const get = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'get', key }
      });

      if (error) throw error;

      if (data?.data) {
        setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
        logger.debug(`Cache hit: ${key}`);
        return data.data;
      }

      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache get error for ${key}:`, error);
      return null;
    }
  }, []);

  const set = useCallback(async <T>(key: string, value: T, options: CacheOptions = {}): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('cache-manager', {
        body: { 
          action: 'set', 
          key, 
          value, 
          ttl: options.ttl || 300 
        }
      });

      if (error) throw error;
      logger.debug(`Cache set: ${key}`);
    } catch (error) {
      logger.error(`Cache set error for ${key}:`, error);
    }
  }, []);

  const invalidate = useCallback(async (key: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'delete', key }
      });

      if (error) throw error;
      logger.debug(`Cache invalidated: ${key}`);
    } catch (error) {
      logger.error(`Cache invalidate error for ${key}:`, error);
    }
  }, []);

  const invalidatePattern = useCallback(async (pattern: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'invalidate', pattern }
      });

      if (error) throw error;
      logger.debug(`Cache pattern invalidated: ${pattern}`);
    } catch (error) {
      logger.error(`Cache pattern invalidate error:`, error);
    }
  }, []);

  const flush = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'flush' }
      });

      if (error) throw error;
      logger.info('Cache flushed');
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }, []);

  const getStats = useCallback(async (): Promise<CacheStats> => {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'stats' }
      });

      if (error) throw error;

      const newStats = {
        hits: stats.hits,
        misses: stats.misses,
        size: data?.data?.totalKeys || 0,
        redisAvailable: data?.data?.redisAvailable || false
      };

      setStats(newStats);
      return newStats;
    } catch (error) {
      logger.error('Cache stats error:', error);
      return stats;
    }
  }, [stats]);

  return {
    get,
    set,
    invalidate,
    invalidatePattern,
    flush,
    getStats,
    stats
  };
}
