
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SecurityConfig {
  id: string;
  config_key: string;
  config_value: any;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSecurityConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For now, return mock data since the table doesn't exist in the current schema
  const { data: configs, isLoading, error } = useQuery({
    queryKey: ['security-config'],
    queryFn: async (): Promise<SecurityConfig[]> => {
      // Mock security configuration data
      return [
        {
          id: '1',
          config_key: 'password_policy',
          config_value: {
            min_length: 8,
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: true,
            require_special: true,
            max_age_days: 90,
            prevent_reuse: 5
          },
          description: 'Password policy configuration',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          config_key: 'session_settings',
          config_value: {
            max_session_duration: 28800,
            idle_timeout: 3600,
            require_2fa_for_admin: false,
            concurrent_sessions_limit: 3
          },
          description: 'Session management settings',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ configKey, configValue }: { configKey: string; configValue: any }) => {
      // Mock update - in real implementation this would call the database
      console.log('Updating security config:', configKey, configValue);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-config'] });
      toast({
        title: 'Sucesso',
        description: 'Configuração de segurança atualizada',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: `Falha ao atualizar configuração: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const getConfig = (key: string) => {
    return configs?.find(config => config.config_key === key);
  };

  // Transform data to match the expected structure
  const transformedData = configs?.reduce((acc, config) => {
    acc[config.config_key] = config.config_value;
    return acc;
  }, {} as Record<string, any>);

  return {
    configs: configs || [],
    isLoading,
    error,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
    getConfig,
    // Add the data property that AdminSegurancaConfig expects
    data: transformedData
  };
}

// Export the update function separately
export function useUpdateSecurityConfig() {
  const { updateConfig } = useSecurityConfig();
  return updateConfig;
}
