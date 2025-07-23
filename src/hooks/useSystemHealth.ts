import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

interface SystemHealthData {
  status: string;
  uptime?: number | string;
  services: Record<string, {
    status: string;
    response_time_ms?: number;
    error?: string;
  }>;
  timestamp: string;
  response_time_ms?: number;
}

interface HealthLog {
  id: string;
  service_name: string;
  status: string;
  response_time_ms?: number;
  error_message?: string;
  error_details: Record<string, any>;
  created_at: string;
}

export const useSystemHealth = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async (): Promise<SystemHealthData | null> => {
      if (!user) return null;

      try {
        const { data, error } = await supabase.functions.invoke('health-check');

        // Handle both success and error responses from health-check
        // The function returns 503 for 'down' status, but still provides data
        if (data) {
          return data;
        }
        
        // If there's an error but it contains health data, use it
        if (error && typeof error === 'object' && 'status' in error) {
          return error as SystemHealthData;
        }
        
        // Only throw if there's a real connection error
        if (error) throw error;
        return null;
      } catch (fetchError) {
        // Handle network errors or function unavailable
        console.warn('Health check failed:', fetchError);
        return {
          status: 'down',
          services: {},
          timestamp: new Date().toISOString(),
          uptime: '0 hours'
        };
      }
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2, // Retry failed requests
  });
};

export const useHealthLogs = (
  serviceFilter?: string,
  statusFilter?: string,
  limit: number = 100
) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['health-logs', serviceFilter, statusFilter, limit],
    queryFn: async (): Promise<HealthLog[]> => {
      if (!user) return [];

      // Using supabase.functions.invoke to call health-check and get logs indirectly
      // For now, return mock data until tables are available in types
      return [
        {
          id: '1',
          service_name: 'supabase',
          status: 'ok',
          response_time_ms: 150,
          error_message: null,
          error_details: {},
          created_at: new Date().toISOString()
        }
      ];
    },
    enabled: !!user,
  });
};

export const useHealthStatus = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['health-status'],
    queryFn: async () => {
      if (!user) return [];

      // Using mock data until tables are available in types
      return [
        {
          service_name: 'supabase',
          current_status: 'ok',
          last_check_at: new Date().toISOString(),
          average_response_time_ms: 150
        },
        {
          service_name: 'storage',
          current_status: 'ok',
          last_check_at: new Date().toISOString(),
          average_response_time_ms: 200
        },
        {
          service_name: 'auth',
          current_status: 'ok',
          last_check_at: new Date().toISOString(),
          average_response_time_ms: 100
        }
      ];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

export const useRunHealthCheck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('health-check');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate health queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['system-health'] });
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
      queryClient.invalidateQueries({ queryKey: ['health-status'] });
    },
  });
};