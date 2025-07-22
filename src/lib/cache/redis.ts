import { Redis } from '@upstash/redis';
import { createLogger } from '@/utils/logger';

const cacheLogger = createLogger('cache');

// Cliente Redis (usando Upstash)
let redisClient: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (!redisClient) {
    try {
      // Configuração do Redis usando variáveis de ambiente
      const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
      const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
      
      if (!redisUrl || !redisToken) {
        cacheLogger.warn('Redis não configurado. Usando fallback sem cache.');
        return null;
      }
      
      redisClient = new Redis({
        url: redisUrl,
        token: redisToken,
      });
      
      cacheLogger.info('Redis client inicializado');
    } catch (error) {
      cacheLogger.error('Erro ao conectar com Redis:', error);
      return null;
    }
  }
  
  return redisClient;
};

export const isRedisAvailable = (): boolean => {
  return getRedisClient() !== null;
};

// Tipos para cache
export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl?: number; // TTL em segundos
  force?: boolean; // Forçar atualização do cache
}

// Configurações de TTL por tipo de cache
export const CACHE_TTL = {
  DASHBOARD: 60, // 1 minuto
  PRODUCTS_LIST: 600, // 10 minutos
  REPORTS: 900, // 15 minutos
  CATALOG: 86400, // 24 horas
  FINANCIAL: 300, // 5 minutos
  CUSTOMERS: 1800, // 30 minutos
  DEFAULT: 300, // 5 minutos
} as const;

// Gerar chaves padronizadas
export const generateCacheKey = (
  type: string,
  companyId?: string,
  ...params: (string | number)[]
): string => {
  const parts = [type];
  
  if (companyId) {
    parts.push(`company:${companyId}`);
  }
  
  parts.push(...params.map(String));
  
  return parts.join(':');
};

// Cache Manager
export class CacheManager {
  private redis: Redis | null;
  private fallbackCache: Map<string, CacheItem> = new Map();
  
  constructor() {
    this.redis = getRedisClient();
  }
  
  /**
   * Buscar item do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const data = await this.redis.get(key);
        if (data) {
          cacheLogger.debug(`Cache hit: ${key}`);
          return data as T;
        }
      } else {
        // Fallback para cache em memória
        const item = this.fallbackCache.get(key);
        if (item && Date.now() < item.timestamp + item.ttl * 1000) {
          cacheLogger.debug(`Fallback cache hit: ${key}`);
          return item.data as T;
        }
      }
      
      cacheLogger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      cacheLogger.error(`Erro ao buscar cache ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Salvar item no cache
   */
  async set<T>(key: string, data: T, ttl: number = CACHE_TTL.DEFAULT): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, ttl, data);
        cacheLogger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
      } else {
        // Fallback para cache em memória
        this.fallbackCache.set(key, {
          data,
          timestamp: Date.now(),
          ttl,
        });
        cacheLogger.debug(`Fallback cache set: ${key} (TTL: ${ttl}s)`);
      }
    } catch (error) {
      cacheLogger.error(`Erro ao salvar cache ${key}:`, error);
    }
  }
  
  /**
   * Invalidar item do cache
   */
  async invalidate(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key);
        cacheLogger.debug(`Cache invalidated: ${key}`);
      } else {
        this.fallbackCache.delete(key);
        cacheLogger.debug(`Fallback cache invalidated: ${key}`);
      }
    } catch (error) {
      cacheLogger.error(`Erro ao invalidar cache ${key}:`, error);
    }
  }
  
  /**
   * Invalidar múltiplas chaves por padrão
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          cacheLogger.debug(`Cache pattern invalidated: ${pattern} (${keys.length} keys)`);
        }
      } else {
        // Fallback para cache em memória
        const keysToDelete = Array.from(this.fallbackCache.keys()).filter(key => 
          key.includes(pattern.replace('*', ''))
        );
        keysToDelete.forEach(key => this.fallbackCache.delete(key));
        cacheLogger.debug(`Fallback cache pattern invalidated: ${pattern} (${keysToDelete.length} keys)`);
      }
    } catch (error) {
      cacheLogger.error(`Erro ao invalidar padrão ${pattern}:`, error);
    }
  }
  
  /**
   * Limpar todo o cache
   */
  async flush(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.flushall();
        cacheLogger.info('Cache totalmente limpo');
      } else {
        this.fallbackCache.clear();
        cacheLogger.info('Fallback cache totalmente limpo');
      }
    } catch (error) {
      cacheLogger.error('Erro ao limpar cache:', error);
    }
  }
  
  /**
   * Obter informações do cache
   */
  async getStats(): Promise<{
    keys: string[];
    redisAvailable: boolean;
    fallbackSize: number;
  }> {
    try {
      let keys: string[] = [];
      
      if (this.redis) {
        keys = await this.redis.keys('*');
      }
      
      return {
        keys,
        redisAvailable: this.redis !== null,
        fallbackSize: this.fallbackCache.size,
      };
    } catch (error) {
      cacheLogger.error('Erro ao obter estatísticas do cache:', error);
      return {
        keys: [],
        redisAvailable: false,
        fallbackSize: this.fallbackCache.size,
      };
    }
  }
}

// Instância global do cache manager
export const cacheManager = new CacheManager();