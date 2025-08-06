
// Mock implementation for Redis cache to replace legacy edge function calls
import { createLogger } from '@/utils/logger';

const logger = createLogger('redis-cache');

interface CacheOptions {
  ttl?: number;
}

export class MockRedisCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    logger.debug(`Cache hit for key: ${key}`);
    return item.data as T;
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 300; // 5 minutes default
    const expires = Date.now() + (ttl * 1000);
    
    this.cache.set(key, { data, expires });
    logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
    logger.debug(`Cache invalidated for key: ${key}`);
  }

  async flush(): Promise<void> {
    this.cache.clear();
    logger.info('Cache flushed');
  }
}

const mockCache = new MockRedisCache();

export const useRedisCache = () => {
  return mockCache;
};
