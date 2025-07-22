import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuditLogFilters {
  company_id?: string;
  user_id?: string;
  action?: string;
  resource_type?: string;
  severity?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  severity: string;
  status: string;
  details: any;
  created_at: string;
}

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  const { toast } = useToast();

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      // For now, return mock data since the table might not be in the types yet
      return [] as AuditLog[];
    },
    enabled: true,
  });

  return {
    logs,
    isLoading,
    error,
    refetch
  };
};