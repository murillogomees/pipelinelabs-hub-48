
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

export const useNFeIntegration = () => {
  const { currentCompanyId } = usePermissions();

  const { data: nfeConfig, isLoading, refetch } = useQuery({
    queryKey: ['nfe-config', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return null;

      const { data, error } = await supabase
        .from('nfe_configs')
        .select('*')
        .eq('company_id', currentCompanyId)
        .single();

      if (error) {
        console.error('Error fetching NFe config:', error);
        return null;
      }

      return data;
    },
    enabled: !!currentCompanyId
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('test-nfe-connection', {
        body: { companyId: currentCompanyId }
      });

      if (error) throw error;
      return data;
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      const { data, error } = await supabase
        .from('nfe_configs')
        .upsert({
          ...config,
          company_id: currentCompanyId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;
    }
  });

  return {
    nfeConfig,
    isLoading,
    testConnection: testConnectionMutation.mutate,
    updateConfig: updateConfigMutation.mutate,
    isTestingConnection: testConnectionMutation.isPending,
    isUpdatingConfig: updateConfigMutation.isPending,
    refetch
  };
};
