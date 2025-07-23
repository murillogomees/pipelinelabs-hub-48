import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceSyncLog {
  id: string;
  integration_id: string;
  event_type: string;
  direction: 'import' | 'export';
  status: 'success' | 'error' | 'pending';
  error_message: string | null;
  records_processed: number;
  records_failed: number;
  metadata: Record<string, any>;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  created_at: string;
}

export const useMarketplaceSyncLogs = (integrationId?: string) => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['marketplace-sync-logs', integrationId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('marketplace_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as MarketplaceSyncLog[];
    },
    enabled: true
  });

  return {
    logs,
    isLoading
  };
};