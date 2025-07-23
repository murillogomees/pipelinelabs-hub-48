import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ErrorStats {
  total24h: number;
  errorRate: string;
  avgResponseTime: string;
}

interface RecentError {
  title: string;
  message: string;
  level: 'error' | 'warning' | 'info';
  timestamp: string;
  url?: string;
  count: number;
  users?: number;
}

export function useSentryMetrics() {
  const { data: errorStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['sentry-error-stats'],
    queryFn: async (): Promise<ErrorStats> => {
      try {
        const { data, error } = await supabase.functions.invoke('sentry-metrics', {
          body: { action: 'stats', timeframe: '24h' }
        });

        if (error) throw error;
        
        return data || {
          total24h: 0,
          errorRate: '0.0',
          avgResponseTime: '0'
        };
      } catch (error) {
        console.warn('Failed to fetch Sentry stats:', error);
        return {
          total24h: 0,
          errorRate: '0.0',
          avgResponseTime: '0'
        };
      }
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: recentErrors, isLoading: isLoadingErrors } = useQuery({
    queryKey: ['sentry-recent-errors'],
    queryFn: async (): Promise<RecentError[]> => {
      try {
        const { data, error } = await supabase.functions.invoke('sentry-metrics', {
          body: { action: 'recent-errors', limit: 10 }
        });

        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.warn('Failed to fetch recent errors:', error);
        return [];
      }
    },
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const sentryProjectUrl = `https://sentry.io/organizations/${import.meta.env.VITE_SENTRY_ORG || 'your-org'}/projects/${import.meta.env.VITE_SENTRY_PROJECT || 'your-project'}/`;

  return {
    errorStats,
    recentErrors,
    isLoading: isLoadingStats || isLoadingErrors,
    sentryProjectUrl
  };
}