
// Mock implementation for Redis cache to replace legacy edge function calls
import { createLogger } from '@/utils/logger';

const logger = createLogger('redis-cache');

interface CacheOptions {
  ttl?: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  redisAvailable: boolean;
}

export class MockRedisCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  public stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    redisAvailable: false
  };

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }
    
    this.stats.hits++;
    logger.debug(`Cache hit for key: ${key}`);
    return item.data as T;
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 300; // 5 minutes default
    const expires = Date.now() + (ttl * 1000);
    
    this.cache.set(key, { data, expires });
    this.stats.size = this.cache.size;
    logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
    this.stats.size = this.cache.size;
    logger.debug(`Cache invalidated for key: ${key}`);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
    this.stats.size = this.cache.size;
    logger.debug(`Cache pattern invalidated: ${pattern}`);
  }

  async flush(): Promise<void> {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
    logger.info('Cache flushed');
  }

  async getStats(): Promise<CacheStats> {
    return this.stats;
  }
}

const mockCache = new MockRedisCache();

export const useRedisCache = () => {
  return mockCache;
};
