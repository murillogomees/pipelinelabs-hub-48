import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AnalyticsMetrics {
  total_events: number;
  unique_users: number;
  top_events: Array<{ event_name: string; count: number }>;
  events_by_day: Record<string, number>;
  device_breakdown: Record<string, number>;
  route_breakdown: Record<string, number>;
}

export const useAnalyticsMetrics = (
  startDate?: string,
  endDate?: string,
  eventFilter?: string
) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['analytics-metrics', startDate, endDate, eventFilter],
    queryFn: async (): Promise<AnalyticsMetrics | null> => {
      if (!user) return null;

      const { data, error } = await supabase.rpc('get_analytics_metrics' as any, {
        p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0],
        p_event_filter: eventFilter
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user
  });
};