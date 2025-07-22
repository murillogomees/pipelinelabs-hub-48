import { cacheManager, generateCacheKey } from '@/lib/cache/redis';
import { createLogger } from '@/utils/logger';

const invalidationLogger = createLogger('cache-invalidation');

// Tipos de eventos que invalidam cache
export type CacheInvalidationEvent =
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'sale.created'
  | 'sale.updated'
  | 'sale.deleted'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'financial.created'
  | 'financial.updated'
  | 'financial.deleted'
  | 'stock.movement'
  | 'report.generated'
  | 'user.login'
  | 'user.logout';

// Mapeamento de eventos para padrões de cache que devem ser invalidados
const INVALIDATION_PATTERNS: Record<CacheInvalidationEvent, (companyId: string, data?: any) => string[]> = {
  'product.created': (companyId) => [
    `*products*company:${companyId}*`,
    `*dashboard*company:${companyId}*`,
    `*top_products*company:${companyId}*`,
    `*catalog*`
  ],
  
  'product.updated': (companyId) => [
    `*products*company:${companyId}*`,
    `*dashboard*company:${companyId}*`,
    `*top_products*company:${companyId}*`,
    `*catalog*`
  ],
  
  'product.deleted': (companyId) => [
    `*products*company:${companyId}*`,
    `*dashboard*company:${companyId}*`,
    `*top_products*company:${companyId}*`,
    `*catalog*`
  ],
  
  'sale.created': (companyId) => [
    `*dashboard*company:${companyId}*`,
    `*financial*company:${companyId}*`,
    `*top_customers*company:${companyId}*`,
    `*top_products*company:${companyId}*`,
    `*report*company:${companyId}*`
  ],
  
  'sale.updated': (companyId) => [
    `*dashboard*company:${companyId}*`,
    `*financial*company:${companyId}*`,
    `*top_customers*company:${companyId}*`,
    `*top_products*company:${companyId}*`,
    `*report*company:${companyId}*`
  ],
  
  'sale.deleted': (companyId) => [
    `*dashboard*company:${companyId}*`,
    `*financial*company:${companyId}*`,
    `*top_customers*company:${companyId}*`,
    `*top_products*company:${companyId}*`,
    `*report*company:${companyId}*`
  ],
  
  'customer.created': (companyId) => [
    `*dashboard*company:${companyId}*`,
    `*top_customers*company:${companyId}*`
  ],
  
  'customer.updated': (companyId) => [
    `*dashboard*company:${companyId}*`,
    `*top_customers*company:${companyId}*`
  ],
  
  'customer.deleted': (companyId) => [
    `*dashboard*company:${companyId}*`,
    `*top_customers*company:${companyId}*`
  ],
  
  'financial.created': (companyId) => [
    `*dashboard*company:${companyId}*`,
    `*financial*company:${companyId}*`,
    `*report*company:${companyId}*`
  ],
  
  'financial.updated': (companyId) => [
    `*dashboard*company:${companyId}*`,
    `*financial*company:${companyId}*`,
    `*report*company:${companyId}*`
  ],
  
  'financial.deleted': (companyId) => [
    `*dashboard*company:${companyId}*`,
    `*financial*company:${companyId}*`,
    `*report*company:${companyId}*`
  ],
  
  'stock.movement': (companyId) => [
    `*dashboard*company:${companyId}*`,
    `*products*company:${companyId}*`
  ],
  
  'report.generated': (companyId) => [
    `*report*company:${companyId}*`
  ],
  
  'user.login': (companyId) => [
    // Normalmente não invalidamos cache no login
  ],
  
  'user.logout': (companyId) => [
    // Normalmente não invalidamos cache no logout
  ]
};

// Função para invalidar cache baseado em eventos
export async function invalidateCacheByEvent(
  event: CacheInvalidationEvent,
  companyId: string,
  data?: any
): Promise<void> {
  try {
    const patterns = INVALIDATION_PATTERNS[event](companyId, data);
    
    if (patterns.length === 0) {
      return;
    }
    
    invalidationLogger.info(`Invalidating cache for event: ${event}, company: ${companyId}`);
    
    // Invalidar todos os padrões relacionados
    for (const pattern of patterns) {
      await cacheManager.invalidatePattern(pattern);
      invalidationLogger.debug(`Cache pattern invalidated: ${pattern}`);
    }
    
    invalidationLogger.info(`Cache invalidation completed for event: ${event}`);
  } catch (error) {
    invalidationLogger.error(`Error invalidating cache for event ${event}:`, error);
  }
}

// Função para invalidar cache de uma empresa específica
export async function invalidateCompanyCache(companyId: string): Promise<void> {
  try {
    const pattern = `*company:${companyId}*`;
    await cacheManager.invalidatePattern(pattern);
    invalidationLogger.info(`All cache invalidated for company: ${companyId}`);
  } catch (error) {
    invalidationLogger.error(`Error invalidating company cache for ${companyId}:`, error);
  }
}

// Função para invalidar cache de relatórios
export async function invalidateReportsCache(companyId: string): Promise<void> {
  try {
    const pattern = `*report*company:${companyId}*`;
    await cacheManager.invalidatePattern(pattern);
    invalidationLogger.info(`Reports cache invalidated for company: ${companyId}`);
  } catch (error) {
    invalidationLogger.error(`Error invalidating reports cache for ${companyId}:`, error);
  }
}

// Função para invalidar cache público (catálogo)
export async function invalidatePublicCache(): Promise<void> {
  try {
    const pattern = '*catalog*';
    await cacheManager.invalidatePattern(pattern);
    invalidationLogger.info('Public cache invalidated');
  } catch (error) {
    invalidationLogger.error('Error invalidating public cache:', error);
  }
}

// Hook para integrar com componentes React
export function useCacheInvalidationOnMutation() {
  const invalidateOnMutation = async (
    mutationType: 'create' | 'update' | 'delete',
    resourceType: 'product' | 'sale' | 'customer' | 'financial' | 'stock',
    companyId: string,
    data?: any
  ) => {
    const event = `${resourceType}.${mutationType}` as CacheInvalidationEvent;
    await invalidateCacheByEvent(event, companyId, data);
  };
  
  return {
    invalidateOnMutation
  };
}

// Middleware para invalidação automática em mutations
export function withCacheInvalidation<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  event: CacheInvalidationEvent,
  getCompanyId: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const result = await fn(...args);
    const companyId = getCompanyId(...args);
    
    // Invalidar cache após a operação bem-sucedida
    await invalidateCacheByEvent(event, companyId);
    
    return result;
  }) as T;
}

// Utilitário para cache warming (pré-aquecimento)
export async function warmUpCache(companyId: string): Promise<void> {
  try {
    invalidationLogger.info(`Warming up cache for company: ${companyId}`);
    
    // Aqui você pode adicionar lógica para pré-carregar dados críticos
    // Por exemplo, carregar dashboard, produtos principais, etc.
    
    invalidationLogger.info(`Cache warming completed for company: ${companyId}`);
  } catch (error) {
    invalidationLogger.error(`Error warming up cache for company ${companyId}:`, error);
  }
}