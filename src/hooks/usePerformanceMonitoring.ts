
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createLogger } from '@/utils/logger';

const logger = createLogger('usePerformanceMonitoring');

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  timing: {
    domContentLoaded: number;
    loadComplete: number;
    firstContentfulPaint: number;
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  queryCache: {
    activeQueries: number;
    staleQueries: number;
    totalQueries: number;
  };
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const collectMetrics = useCallback(() => {
    try {
      // Core Web Vitals
      const performanceEntries = performance.getEntriesByType('navigation');
      const timing = performanceEntries[0] as PerformanceNavigationTiming;
      
      // Memory info (if available)
      const memoryInfo = (performance as any).memory;
      
      // React Query cache info
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      const newMetrics: PerformanceMetrics = {
        lcp: null, // Will be updated by observer
        fid: null, // Will be updated by observer
        cls: null, // Will be updated by observer
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || null,
        ttfb: timing?.responseStart || null,
        timing: {
          domContentLoaded: timing ? timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart : 0,
          loadComplete: timing ? timing.loadEventEnd - timing.loadEventStart : 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        },
        memory: memoryInfo ? {
          usedJSHeapSize: memoryInfo.usedJSHeapSize,
          totalJSHeapSize: memoryInfo.totalJSHeapSize,
          jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
        } : undefined,
        queryCache: {
          activeQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
          staleQueries: queries.filter(q => q.state.isStale).length,
          totalQueries: queries.length,
        }
      };
      
      setMetrics(newMetrics);
      setIsLoading(false);
      
      logger.debug('Performance metrics collected', newMetrics);
    } catch (error) {
      logger.error('Error collecting performance metrics:', error);
      setIsLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    // Initial collection
    collectMetrics();
    
    // Set up performance observers
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          setMetrics(prev => {
            if (!prev) return prev;
            
            const updated = { ...prev };
            
            switch (entry.entryType) {
              case 'largest-contentful-paint':
                updated.lcp = entry.startTime;
                break;
              case 'first-input':
                const fidEntry = entry as PerformanceEventTiming;
                updated.fid = fidEntry.processingStart - fidEntry.startTime;
                break;
              case 'layout-shift':
                const clsEntry = entry as any;
                if (!clsEntry.hadRecentInput) {
                  updated.cls = (prev.cls || 0) + clsEntry.value;
                }
                break;
            }
            
            return updated;
          });
        }
      });
      
      observer.observe({ 
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] 
      });
      
      return () => observer.disconnect();
    } catch (error) {
      logger.warn('Performance Observer not supported:', error);
    }
  }, [collectMetrics]);

  // Periodic updates
  useEffect(() => {
    const interval = setInterval(collectMetrics, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [collectMetrics]);

  const getPerformanceScore = useCallback(() => {
    if (!metrics || !metrics.lcp || !metrics.fid || metrics.cls === null) return null;
    
    let score = 100;
    
    // LCP scoring (weight: 25%)
    if (metrics.lcp > 4000) score -= 25;
    else if (metrics.lcp > 2500) score -= 15;
    else if (metrics.lcp > 1500) score -= 5;
    
    // FID scoring (weight: 25%) 
    if (metrics.fid > 300) score -= 25;
    else if (metrics.fid > 100) score -= 15;
    else if (metrics.fid > 50) score -= 5;
    
    // CLS scoring (weight: 25%)
    if (metrics.cls > 0.25) score -= 25;
    else if (metrics.cls > 0.1) score -= 15;
    else if (metrics.cls > 0.05) score -= 5;
    
    return Math.max(0, score);
  }, [metrics]);

  return {
    metrics,
    isLoading,
    score: getPerformanceScore(),
    refresh: collectMetrics
  };
}
