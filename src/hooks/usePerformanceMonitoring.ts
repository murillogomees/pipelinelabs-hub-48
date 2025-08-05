
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  renderTime: number;
  queryStats: {
    totalQueries: number;
    cachedQueries: number;
    staleQueries: number;
    errorQueries: number;
  };
  webVitals: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  };
  performanceScore: number;
  timing?: {
    loadComplete?: number;
  };
  memory?: {
    usedJSHeapSize?: number;
  };
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: { used: 0, total: 0, percentage: 0 },
    renderTime: 0,
    queryStats: { totalQueries: 0, cachedQueries: 0, staleQueries: 0, errorQueries: 0 },
    webVitals: {},
    performanceScore: 0,
    timing: { loadComplete: 0 },
    memory: { usedJSHeapSize: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const queryClient = useQueryClient();

  const calculateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
      };
    }
    return { used: 0, total: 0, percentage: 0 };
  }, []);

  const calculateQueryStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      cachedQueries: queries.filter(q => q.state.data !== undefined).length,
      staleQueries: queries.filter(q => q.state.dataUpdatedAt < Date.now() - 300000).length, // 5 minutes stale
      errorQueries: queries.filter(q => q.state.error !== null).length,
    };
  }, [queryClient]);

  const measureRenderTime = useCallback(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      return endTime - startTime;
    };
  }, []);

  const collectWebVitals = useCallback(() => {
    const vitals: any = {};
    
    // Use PerformanceObserver if available
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
            // Handle first-input with proper type checking
            if (entry.entryType === 'first-input' && 'processingStart' in entry) {
              vitals.fid = (entry as any).processingStart - entry.startTime;
            }
          }
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });
      } catch (e) {
        // PerformanceObserver not supported
      }
    }
    
    return vitals;
  }, []);

  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics) => {
    let score = 100;
    
    // Memory usage impact (0-30 points)
    if (metrics.memoryUsage.percentage > 80) score -= 30;
    else if (metrics.memoryUsage.percentage > 60) score -= 20;
    else if (metrics.memoryUsage.percentage > 40) score -= 10;
    
    // Query performance impact (0-20 points)
    const queryErrorRate = metrics.queryStats.totalQueries > 0 
      ? (metrics.queryStats.errorQueries / metrics.queryStats.totalQueries) * 100 
      : 0;
    score -= Math.min(queryErrorRate, 20);
    
    // Render time impact (0-25 points)
    if (metrics.renderTime > 16) score -= 25; // 60 FPS threshold
    else if (metrics.renderTime > 8) score -= 15;
    else if (metrics.renderTime > 4) score -= 5;
    
    // Web Vitals impact (0-25 points)
    if (metrics.webVitals.lcp && metrics.webVitals.lcp > 2500) score -= 15;
    if (metrics.webVitals.fid && metrics.webVitals.fid > 100) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }, []);

  const updateMetrics = useCallback(() => {
    const endRender = measureRenderTime();
    
    setTimeout(() => {
      const memoryUsage = calculateMemoryUsage();
      const newMetrics: PerformanceMetrics = {
        memoryUsage,
        renderTime: endRender(),
        queryStats: calculateQueryStats(),
        webVitals: collectWebVitals(),
        performanceScore: 0, // Will be calculated below
        timing: { loadComplete: endRender() },
        memory: { usedJSHeapSize: memoryUsage.used * 1024 * 1024 },
      };
      
      newMetrics.performanceScore = calculatePerformanceScore(newMetrics);
      setMetrics(newMetrics);
      setIsLoading(false);
    }, 0);
  }, [calculateMemoryUsage, calculateQueryStats, collectWebVitals, measureRenderTime, calculatePerformanceScore]);

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [updateMetrics]);

  return {
    metrics,
    isLoading,
    refreshMetrics: updateMetrics,
  };
}
