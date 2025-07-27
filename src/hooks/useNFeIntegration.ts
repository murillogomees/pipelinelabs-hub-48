
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

export const useNFeIntegration = () => {
  const { currentCompanyId } = usePermissions();
  const { toast } = useToast();

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
    mutationFn: async (config?: any) => {
      const { data, error } = await supabase.functions.invoke('test-nfe-connection', {
        body: { companyId: currentCompanyId, config }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Conexão testada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao testar conexão',
        variant: 'destructive',
      });
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
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Configuração salva com sucesso',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar configuração',
        variant: 'destructive',
      });
    }
  });

  const validateCertificateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('validate-certificate', {
        body: { companyId: currentCompanyId }
      });

      if (error) throw error;
      return data;
    }
  });

  // Helper functions
  const getConfig = () => {
    return nfeConfig || {};
  };

  const isConfigured = Boolean(nfeConfig?.api_token);
  const isActive = Boolean(nfeConfig?.is_active);
  const hasValidConfig = () => Boolean(nfeConfig?.certificate_file && nfeConfig?.certificate_password);

  const saveNFeConfig = async (config: any) => {
    return updateConfigMutation.mutateAsync(config);
  };

  const validateCertificate = async () => {
    return validateCertificateMutation.mutateAsync();
  };

  return {
    nfeConfig,
    isLoading,
    testConnection: testConnectionMutation.mutate,
    updateConfig: updateConfigMutation.mutate,
    isTestingConnection: testConnectionMutation.isPending,
    isUpdatingConfig: updateConfigMutation.isPending,
    refetch,
    // Additional properties expected by components
    saveNFeConfig,
    getConfig,
    isConfigured,
    isActive,
    isSaving: updateConfigMutation.isPending,
    testingConnection: testConnectionMutation.isPending,
    validateCertificate,
    hasValidConfig,
    uploadingCertificate: false, // Add this for certificate upload state
  };
};
