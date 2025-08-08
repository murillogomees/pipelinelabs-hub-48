
import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheConfig<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number; // Time to live em milissegundos
  staleTime?: number; // Tempo em que os dados são considerados frescos
  enabled?: boolean;
  fallbackData?: T;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isStale: boolean;
}

// Cache global para persistir dados entre componentes
const globalCache = new Map<string, CacheEntry<any>>();

// Salvar cache no localStorage
const saveToLocalStorage = (key: string, entry: CacheEntry<any>) => {
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data: entry.data,
      timestamp: entry.timestamp,
      isStale: entry.isStale
    }));
  } catch (error) {
    console.warn('Erro ao salvar cache no localStorage:', error);
  }
};

// Carregar cache do localStorage
const loadFromLocalStorage = <T>(key: string): CacheEntry<T> | null => {
  try {
    const stored = localStorage.getItem(`cache_${key}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Erro ao carregar cache do localStorage:', error);
  }
  return null;
};

export function useCache<T>(config: CacheConfig<T>) {
  const { 
    key, 
    fetcher, 
    ttl = 300000, // 5 minutos default
    staleTime = 60000, // 1 minuto default
    enabled = true,
    fallbackData
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const fetchInProgressRef = useRef(false);

  // Verificar se os dados estão válidos
  const isDataValid = useCallback((entry: CacheEntry<T>) => {
    const now = Date.now();
    return (now - entry.timestamp) < ttl;
  }, [ttl]);

  // Verificar se os dados estão frescos (não stale)
  const isDataFresh = useCallback((entry: CacheEntry<T>) => {
    const now = Date.now();
    return (now - entry.timestamp) < staleTime;
  }, [staleTime]);

  // Carregar dados do cache
  const loadFromCache = useCallback(() => {
    // Primeiro tentar cache em memória
    let cached = globalCache.get(key);
    
    // Se não encontrar em memória, tentar localStorage
    if (!cached) {
      cached = loadFromLocalStorage<T>(key);
      if (cached) {
        globalCache.set(key, cached);
      }
    }

    if (cached && isDataValid(cached)) {
      setData(cached.data);
      setError(null);
      setIsLoading(false);
      setLastFetch(cached.timestamp);
      return cached;
    }

    // Se tem fallbackData, usar enquanto carrega
    if (fallbackData && !data) {
      setData(fallbackData);
    }

    return null;
  }, [key, isDataValid, fallbackData, data]);

  // Buscar dados
  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;
    if (fetchInProgressRef.current && !force) return;

    // Verificar se precisa buscar
    if (!force) {
      const cached = loadFromCache();
      if (cached && isDataFresh(cached)) {
        return cached.data;
      }
    }

    fetchInProgressRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Fetching fresh data for cache key: ${key}`);
      const result = await fetcher();
      
      const entry: CacheEntry<T> = {
        data: result,
        timestamp: Date.now(),
        isStale: false
      };

      // Salvar em ambos os caches
      globalCache.set(key, entry);
      saveToLocalStorage(key, entry);

      setData(result);
      setLastFetch(entry.timestamp);
      setError(null);

      console.log(`✅ Cache updated for key: ${key}`);
      return result;
    } catch (err: any) {
      console.error(`❌ Cache fetch error for key ${key}:`, err);
      setError(err);

      // Em caso de erro, tentar usar dados em cache mesmo se stale
      const staleData = globalCache.get(key) || loadFromLocalStorage<T>(key);
      if (staleData && isDataValid(staleData)) {
        console.log(`🔄 Using stale data for key: ${key}`);
        setData(staleData.data);
        setLastFetch(staleData.timestamp);
        return staleData.data;
      }

      // Se não tem cache e tem fallback, usar
      if (fallbackData) {
        setData(fallbackData);
        return fallbackData;
      }

      throw err;
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [enabled, loadFromCache, isDataFresh, key, fetcher, fallbackData, isDataValid]);

  // Invalidar cache
  const invalidateCache = useCallback(() => {
    console.log(`🗑️ Invalidating cache for key: ${key}`);
    globalCache.delete(key);
    localStorage.removeItem(`cache_${key}`);
    setData(null);
    setError(null);
    setLastFetch(0);
  }, [key]);

  // Atualizar cache manualmente
  const updateCache = useCallback((newData: T) => {
    const entry: CacheEntry<T> = {
      data: newData,
      timestamp: Date.now(),
      isStale: false
    };

    globalCache.set(key, entry);
    saveToLocalStorage(key, entry);
    setData(newData);
    setLastFetch(entry.timestamp);
    setError(null);
    
    console.log(`📝 Cache manually updated for key: ${key}`);
  }, [key]);

  // Revalidar (buscar dados frescos em background)
  const revalidate = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Carregar dados iniciais
  useEffect(() => {
    if (enabled) {
      // Primeiro carregar do cache
      const cached = loadFromCache();
      
      // Se não tem cache ou está stale, buscar
      if (!cached || !isDataFresh(cached)) {
        fetchData();
      }
    }
  }, [enabled, key, fetchData, loadFromCache, isDataFresh]);

  // Auto-revalidação em intervalos
  useEffect(() => {
    if (!enabled || !data) return;

    const interval = setInterval(() => {
      const cached = globalCache.get(key);
      if (!cached || !isDataFresh(cached)) {
        fetchData();
      }
    }, staleTime);

    return () => clearInterval(interval);
  }, [enabled, data, key, fetchData, isDataFresh, staleTime]);

  return {
    data,
    isLoading,
    error,
    isStale: lastFetch > 0 && (Date.now() - lastFetch) > staleTime,
    lastFetch: new Date(lastFetch),
    invalidateCache,
    updateCache,
    revalidate,
    refetch: () => fetchData(true)
  };
}
