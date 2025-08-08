
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceHealthState {
  isHealthy: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  consecutiveFailures: number;
  error: any;
  serviceStatus: 'healthy' | 'degraded' | 'outage';
}

export function useServiceHealth() {
  const [health, setHealth] = useState<ServiceHealthState>({
    isHealthy: true,
    isChecking: false,
    lastChecked: null,
    consecutiveFailures: 0,
    error: null,
    serviceStatus: 'healthy'
  });

  const checkHealth = useCallback(async () => {
    setHealth(prev => ({ ...prev, isChecking: true }));
    
    try {
      // Simple health check query
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        // Check if it's an infrastructure error
        const isInfraError = error.code === 'PGRST002' || 
                            error.message?.includes('schema cache') ||
                            error.message?.includes('Service Unavailable');
        
        const serviceStatus = isInfraError ? 'outage' : 'degraded';
        
        setHealth(prev => ({
          isHealthy: false,
          isChecking: false,
          lastChecked: new Date(),
          consecutiveFailures: prev.consecutiveFailures + 1,
          error: error,
          serviceStatus
        }));
        
        // Log infrastructure errors specially
        if (isInfraError) {
          console.warn('🚨 Supabase Infrastructure Issue Detected:', {
            code: error.code,
            message: error.message,
            consecutiveFailures: health.consecutiveFailures + 1,
            timestamp: new Date().toISOString()
          });
        }
        
        return false;
      }
      
      setHealth({
        isHealthy: true,
        isChecking: false,
        lastChecked: new Date(),
        consecutiveFailures: 0,
        error: null,
        serviceStatus: 'healthy'
      });
      
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth(prev => ({
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date(),
        consecutiveFailures: prev.consecutiveFailures + 1,
        error: error,
        serviceStatus: 'degraded'
      }));
      
      return false;
    }
  }, [health.consecutiveFailures]);

  // Auto health check every 30 seconds when unhealthy
  useEffect(() => {
    if (!health.isHealthy && health.consecutiveFailures > 0) {
      const interval = setInterval(() => {
        if (!health.isChecking) {
          console.log('🔄 Auto health check triggered...');
          checkHealth();
        }
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [health.isHealthy, health.consecutiveFailures, health.isChecking, checkHealth]);

  // Initial health check after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      checkHealth();
    }, 1000); // Wait 1 second after mount

    return () => clearTimeout(timer);
  }, [checkHealth]);

  return {
    ...health,
    checkHealth
  };
}
