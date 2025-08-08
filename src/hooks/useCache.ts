
import { useState, useEffect, useCallback } from 'react';

interface CacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number; // Time to live in milliseconds
  staleTime?: number; // Time before data is considered stale
  enabled?: boolean;
  fallbackData?: T;
}

interface CacheState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
}

export function useCache<T>({
  key,
  fetcher,
  ttl = 300000, // 5 minutes default
  staleTime = 60000, // 1 minute default
  enabled = true,
  fallbackData
}: CacheOptions<T>) {
  const [state, setState] = useState<CacheState<T>>({
    data: fallbackData,
    isLoading: enabled,
    error: null,
    isStale: false
  });

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await fetcher();
      setState({
        data,
        isLoading: false,
        error: null,
        isStale: false
      });
      
      // Store in localStorage with timestamp
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl
      }));
    } catch (error) {
      console.error(`Cache fetch error for ${key}:`, error);
      
      // Try to get from localStorage as fallback
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const { data: cachedData } = JSON.parse(cached);
          setState({
            data: cachedData,
            isLoading: false,
            error: error as Error,
            isStale: true
          });
          return;
        } catch {}
      }
      
      setState(prev => ({
        ...prev,
        data: fallbackData || prev.data,
        isLoading: false,
        error: error as Error
      }));
    }
  }, [key, fetcher, enabled, ttl, fallbackData]);

  // Check cache on mount
  useEffect(() => {
    if (!enabled) return;
    
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const { data, timestamp, ttl: cachedTTL } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < (cachedTTL || ttl)) {
          setState({
            data,
            isLoading: false,
            error: null,
            isStale: age > staleTime
          });
          
          // If stale, fetch in background
          if (age > staleTime) {
            fetchData();
          }
          return;
        }
      } catch {}
    }
    
    fetchData();
  }, [key, enabled, ttl, staleTime, fetchData]);

  const updateCache = useCallback((newData: T) => {
    setState({
      data: newData,
      isLoading: false,
      error: null,
      isStale: false
    });
    
    localStorage.setItem(key, JSON.stringify({
      data: newData,
      timestamp: Date.now(),
      ttl
    }));
  }, [key, ttl]);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(key);
    fetchData();
  }, [key, fetchData]);

  return {
    ...state,
    refetch: fetchData,
    updateCache,
    invalidateCache
  };
}
