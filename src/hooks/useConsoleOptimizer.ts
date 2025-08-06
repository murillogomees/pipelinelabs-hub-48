
import { useEffect } from 'react';

export function useConsoleOptimizer() {
  useEffect(() => {
    // Only optimize console in production
    if (process.env.NODE_ENV === 'production') {
      // Disable console methods in production
      console.log = () => {};
      console.warn = () => {};
      console.info = () => {};
    }
  }, []);
}

export function useResourceMonitoring() {
  useEffect(() => {
    // Only monitor resources in development
    if (process.env.NODE_ENV === 'development') {
      // Simple resource monitoring
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.duration > 1000) {
            console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // Observer not supported
      }
      
      return () => {
        try {
          observer.disconnect();
        } catch (e) {
          // Already disconnected
        }
      };
    }
  }, []);
}
