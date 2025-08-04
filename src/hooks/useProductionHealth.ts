import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getEnvironment, isProduction } from '@/utils/environment';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  environment: string;
  services: {
    database: { status: string; response_time_ms?: number };
    auth: { status: string; response_time_ms?: number };
    functions: { status: string; response_time_ms?: number };
  };
  metrics: {
    database_size_mb: number;
    active_connections: number;
    uptime_hours: number;
  };
}

export function useProductionHealth() {
  const environment = getEnvironment();

  const { data: healthStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['production-health', environment],
    queryFn: async (): Promise<HealthStatus> => {
      try {
        const { data, error } = await supabase.functions.invoke('production-health');
        
        if (error) {
          console.error('Health check failed:', error);
          throw error;
        }
        
        return data as HealthStatus;
      } catch (error) {
        console.error('Health check error:', error);
        // Return degraded status if health check fails
        return {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          environment,
          services: {
            database: { status: 'unknown' },
            auth: { status: 'unknown' },
            functions: { status: 'down' }
          },
          metrics: {
            database_size_mb: 0,
            active_connections: 0,
            uptime_hours: 0
          }
        };
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: isProduction() ? 2 * 60 * 1000 : 5 * 60 * 1000, // 2 min in prod, 5 min in dev
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const isHealthy = healthStatus?.status === 'ok';
  const isDegraded = healthStatus?.status === 'degraded';
  const isDown = healthStatus?.status === 'down';

  const getStatusColor = () => {
    switch (healthStatus?.status) {
      case 'ok':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (healthStatus?.status) {
      case 'ok':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'down':
        return '❌';
      default:
        return '❓';
    }
  };

  const getServiceStatus = (serviceName: keyof HealthStatus['services']) => {
    return healthStatus?.services[serviceName] || { status: 'unknown' };
  };

  return {
    healthStatus,
    isLoading,
    error,
    refetch,
    isHealthy,
    isDegraded,
    isDown,
    getStatusColor,
    getStatusIcon,
    getServiceStatus,
    environment,
  };
}