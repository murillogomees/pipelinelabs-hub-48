import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AnalyticsEvent {
  event_name: string;
  device_type?: string;
  route?: string;
  duration_ms?: number;
  meta?: Record<string, any>;
}

interface AnalyticsMetrics {
  total_events: number;
  unique_users: number;
  top_events: Array<{ event_name: string; count: number }>;
  events_by_day: Record<string, number>;
  device_breakdown: Record<string, number>;
  route_breakdown: Record<string, number>;
}

export const useCreateAnalyticsEvent = () => {
  return useMutation({
    mutationFn: async (event: AnalyticsEvent) => {
      const { data, error } = await supabase.rpc('create_analytics_event' as any, {
        p_event_name: event.event_name,
        p_device_type: event.device_type,
        p_route: event.route,
        p_duration_ms: event.duration_ms,
        p_meta: event.meta || {}
      });

      if (error) throw error;
      return data;
    }
  });
};

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

// Hook for tracking events automatically
export const useEventTracker = () => {
  const createEvent = useCreateAnalyticsEvent();
  
  const trackEvent = (event: AnalyticsEvent) => {
    // Detect device type
    const deviceType = window.innerWidth <= 768 ? 'mobile' : 'desktop';
    
    // Get current route
    const route = window.location.pathname;
    
    createEvent.mutate({
      ...event,
      device_type: event.device_type || deviceType,
      route: event.route || route
    });
  };

  const trackPageView = (route?: string) => {
    trackEvent({
      event_name: 'page_view',
      route: route || window.location.pathname,
      meta: {
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackUserAction = (action: string, meta?: Record<string, any>) => {
    trackEvent({
      event_name: action,
      meta
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackUserAction
  };
};