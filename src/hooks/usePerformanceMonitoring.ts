import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  });

  useEffect(() => {
    // Core Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            const fidEntry = entry as PerformanceEventTiming;
            setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }));
            break;
          case 'layout-shift':
            const clsEntry = entry as any; // LayoutShift interface not available in all browsers
            if (!clsEntry.hadRecentInput) {
              setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + clsEntry.value }));
            }
            break;
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({ ...prev, ttfb: navEntry.responseStart }));
            break;
        }
      }
    });

    // Observe all relevant entry types
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      console.warn('Performance Observer not fully supported');
    }

    return () => observer.disconnect();
  }, []);

  const getPerformanceScore = () => {
    const { lcp, fid, cls } = metrics;
    
    if (!lcp || !fid || cls === null) return null;
    
    let score = 100;
    
    // LCP scoring (weight: 25%)
    if (lcp > 4000) score -= 25;
    else if (lcp > 2500) score -= 15;
    else if (lcp > 1500) score -= 5;
    
    // FID scoring (weight: 25%) 
    if (fid > 300) score -= 25;
    else if (fid > 100) score -= 15;
    else if (fid > 50) score -= 5;
    
    // CLS scoring (weight: 25%)
    if (cls > 0.25) score -= 25;
    else if (cls > 0.1) score -= 15;
    else if (cls > 0.05) score -= 5;
    
    return Math.max(0, score);
  };

  return {
    metrics,
    score: getPerformanceScore(),
    isLoading: Object.values(metrics).some(v => v === null)
  };
}