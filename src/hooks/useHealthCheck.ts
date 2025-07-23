import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: string;
  details?: Record<string, any>;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: HealthCheckResult[];
  uptime: string;
  lastCheck: string;
}

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system_health'],
    queryFn: async (): Promise<SystemHealth> => {
      const { data, error } = await supabase.rpc('get_system_health' as any);
      
      if (error) throw error;
      
      return data || {
        overall: 'down',
        services: [],
        uptime: '0 hours',
        lastCheck: new Date().toISOString()
      };
    },
    refetchInterval: 30000, // Check every 30 seconds
  });
};

export const usePerformHealthCheck = () => {
  return useMutation({
    mutationFn: async (serviceName: string) => {
      const startTime = Date.now();
      
      try {
        // Perform specific health checks based on service
        let result: HealthCheckResult;
        
        switch (serviceName) {
          case 'database':
            result = await checkDatabaseHealth();
            break;
          case 'api':
            result = await checkAPIHealth();
            break;
          case 'frontend':
            result = await checkFrontendHealth();
            break;
          default:
            throw new Error(`Unknown service: ${serviceName}`);
        }
        
        const responseTime = Date.now() - startTime;
        
        // Log the health check result
        await supabase.rpc('log_health_check' as any, {
          p_service_name: serviceName,
          p_status: result.status === 'healthy' ? 'ok' : 'error',
          p_response_time_ms: responseTime,
          p_error_message: result.status !== 'healthy' ? `Service ${result.status}` : null,
          p_error_details: result.details || {}
        });
        
        return { ...result, responseTime };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        // Log the failed health check
        await supabase.rpc('log_health_check' as any, {
          p_service_name: serviceName,
          p_status: 'error',
          p_response_time_ms: responseTime,
          p_error_message: error instanceof Error ? error.message : 'Unknown error',
          p_error_details: { error: String(error) }
        });
        
        throw error;
      }
    },
  });
};

// Individual health check functions
async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  try {
    const { data, error } = await supabase.from('companies' as any).select('count').limit(1);
    
    if (error) throw error;
    
    return {
      service: 'database',
      status: 'healthy',
      responseTime: 0, // Will be calculated by caller
      lastChecked: new Date().toISOString(),
      details: { connection: 'ok', query: 'success' }
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'down',
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      details: { error: String(error) }
    };
  }
}

async function checkAPIHealth(): Promise<HealthCheckResult> {
  try {
    const response = await fetch('/api/health', { method: 'GET' });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    return {
      service: 'api',
      status: 'healthy',
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      details: { status: response.status }
    };
  } catch (error) {
    return {
      service: 'api',
      status: 'down',
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      details: { error: String(error) }
    };
  }
}

async function checkFrontendHealth(): Promise<HealthCheckResult> {
  try {
    // Check if basic DOM is working
    if (typeof window === 'undefined') {
      throw new Error('Window object not available');
    }
    
    // Check if React is rendering
    const reactElements = document.querySelectorAll('[data-reactroot], #root');
    if (reactElements.length === 0) {
      throw new Error('React root not found');
    }
    
    return {
      service: 'frontend',
      status: 'healthy',
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      details: { 
        dom: 'ok',
        react: 'ok',
        elements: reactElements.length
      }
    };
  } catch (error) {
    return {
      service: 'frontend',
      status: 'down',
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      details: { error: String(error) }
    };
  }
}