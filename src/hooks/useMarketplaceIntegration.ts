import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentCompany } from './useCurrentCompany';

export interface MarketplaceIntegration {
  id: string;
  company_id: string;
  marketplace: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  auth_type: 'oauth' | 'apikey';
  credentials: Record<string, any>;
  config: Record<string, any>;
  last_sync: string | null;
  last_webhook_received: string | null;
  webhook_status: 'active' | 'inactive' | 'error' | null;
  webhook_url: string | null;
  oauth_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceChannel {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  logo_url: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  config_schema: any;
  webhook_endpoints: any;
  oauth_config: any;
  required_plan_features: string[];
  created_at: string;
  updated_at: string;
}

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

/**
 * Hook centralizador para todas as operações de marketplace
 * Combina channels, integrations, sync logs e webhooks
 */
export const useMarketplaceIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: currentCompany } = useCurrentCompany();

  // ==================== CHANNELS ====================

  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ['marketplace-channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_channels')
        .select('*')
        .order('display_name');
      
      if (error) throw error;
      return data as MarketplaceChannel[];
    }
  });

  const { data: companyConfigs, isLoading: configsLoading } = useQuery({
    queryKey: ['company-marketplace-configs', currentCompany?.company_id],
    queryFn: async () => {
      if (!currentCompany?.company_id) return [];
      
      const { data, error } = await supabase
        .from('company_marketplace_configs')
        .select('*')
        .eq('company_id', currentCompany.company_id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentCompany?.company_id
  });

  // ==================== INTEGRATIONS ====================

  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['marketplace-integrations', currentCompany?.company_id],
    queryFn: async () => {
      if (!currentCompany?.company_id) return [];
      
      const { data, error } = await supabase
        .from('marketplace_integrations')
        .select('*')
        .eq('company_id', currentCompany.company_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MarketplaceIntegration[];
    },
    enabled: !!currentCompany?.company_id
  });

  // ==================== SYNC LOGS ====================

  const { data: syncLogs, isLoading: syncLogsLoading } = useQuery({
    queryKey: ['marketplace-sync-logs', currentCompany?.company_id],
    queryFn: async () => {
      if (!currentCompany?.company_id) return [];
      
      const { data, error } = await supabase
        .from('marketplace_sync_logs')
        .select(`
          *,
          marketplace_integrations!inner(company_id)
        `)
        .eq('marketplace_integrations.company_id', currentCompany.company_id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as MarketplaceSyncLog[];
    },
    enabled: !!currentCompany?.company_id
  });

  // ==================== MUTATIONS ====================

  // Toggle channel activation for company
  const toggleChannelMutation = useMutation({
    mutationFn: async ({ channelName, isEnabled }: { channelName: string; isEnabled: boolean }) => {
      if (!currentCompany?.company_id) {
        throw new Error('Empresa não encontrada');
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) throw new Error('Usuário não autenticado');

      const { data: existing } = await supabase
        .from('company_marketplace_configs')
        .select('*')
        .eq('channel_name', channelName)
        .eq('company_id', currentCompany.company_id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('company_marketplace_configs')
          .update({ is_enabled: isEnabled })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('company_marketplace_configs')
          .insert({
            company_id: currentCompany.company_id,
            channel_name: channelName,
            is_enabled: isEnabled,
            created_by: session.session.user.id
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['company-marketplace-configs'] });
      toast({
        title: "Configuração atualizada",
        description: `Canal ${data.channel_name} ${data.is_enabled ? 'ativado' : 'desativado'} com sucesso.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar configuração do canal.",
        variant: "destructive"
      });
    }
  });

  // Connect marketplace (OAuth or API Key)
  const connectMarketplaceMutation = useMutation({
    mutationFn: async (data: {
      marketplace: string;
      company_id: string;
      integration_type: 'oauth' | 'apikey';
      credentials?: Record<string, any>;
      redirect_url?: string;
    }) => {
      const { data: response, error } = await supabase.functions.invoke('marketplace-connect', {
        body: data
      });

      if (error) throw error;
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-integrations'] });
      
      if (response.type === 'oauth' && response.auth_url) {
        // Redirect to OAuth URL
        window.location.href = response.auth_url;
      } else {
        toast({
          title: "Sucesso",
          description: response.message || "Integração conectada com sucesso!"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na conexão",
        description: error.message || "Erro ao conectar com o marketplace.",
        variant: "destructive"
      });
    }
  });

  // Update integration
  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MarketplaceIntegration> }) => {
      const { data, error } = await supabase
        .from('marketplace_integrations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-integrations'] });
      toast({
        title: "Sucesso",
        description: "Integração atualizada com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar integração.",
        variant: "destructive"
      });
    }
  });

  // Delete integration
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketplace_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-integrations'] });
      toast({
        title: "Sucesso",
        description: "Integração removida com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover integração.",
        variant: "destructive"
      });
    }
  });

  // Test connection
  const testConnectionMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      // Call webhook endpoint to test
      const integration = integrations?.find(i => i.id === integrationId);
      if (!integration) throw new Error('Integração não encontrada');

      const { data, error } = await supabase.functions.invoke('marketplace-auth', {
        body: {
          integration_id: integrationId,
          marketplace: integration.marketplace,
          action: 'validate'
        }
      });

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Teste realizado",
        description: "Conexão testada com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Falha no teste",
        description: error.message || "Erro ao testar conexão.",
        variant: "destructive"
      });
    }
  });

  // Manual sync
  const syncNowMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      // Trigger manual sync
      const { data, error } = await supabase
        .rpc('log_marketplace_sync', {
          p_integration_id: integrationId,
          p_event_type: 'manual_sync',
          p_direction: 'export',
          p_status: 'pending',
          p_records_processed: 0,
          p_metadata: { triggered_by: 'user', triggered_at: new Date().toISOString() }
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-sync-logs'] });
      toast({
        title: "Sincronização iniciada",
        description: "A sincronização foi iniciada em segundo plano."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar sincronização.",
        variant: "destructive"
      });
    }
  });

  // ==================== HELPER FUNCTIONS ====================

  const isChannelEnabled = (channelName: string) => {
    const config = companyConfigs?.find(c => c.channel_name === channelName);
    return config?.is_enabled || false;
  };

  const getIntegrationByMarketplace = (marketplace: string) => {
    return integrations?.find(i => i.marketplace === marketplace);
  };

  const isChannelConnected = (channelName: string) => {
    const integration = getIntegrationByMarketplace(channelName);
    return integration?.status === 'active';
  };

  const getChannelStats = () => {
    const totalChannels = channels?.length || 0;
    const activeChannels = channels?.filter(c => c.status === 'active').length || 0;
    const enabledChannels = companyConfigs?.filter(c => c.is_enabled).length || 0;
    const connectedChannels = integrations?.filter(i => i.status === 'active').length || 0;

    return {
      total: totalChannels,
      active: activeChannels,
      enabled: enabledChannels,
      connected: connectedChannels,
      maintenance: channels?.filter(c => c.status === 'maintenance').length || 0
    };
  };

  const getRecentSyncLogs = (limit = 10) => {
    return syncLogs?.slice(0, limit) || [];
  };

  // Check if user can manage channels
  const canManageChannels = async () => {
    try {
      const { data } = await supabase.rpc('is_super_admin');
      return data;
    } catch {
      return false;
    }
  };

  // ==================== RETURN ====================

  return {
    // Data
    channels: channels || [],
    companyConfigs: companyConfigs || [],
    integrations: integrations || [],
    syncLogs: syncLogs || [],

    // Loading states
    isLoading: channelsLoading || configsLoading || integrationsLoading,
    isSyncLogsLoading: syncLogsLoading,

    // Actions
    toggleChannel: toggleChannelMutation.mutate,
    connectMarketplace: connectMarketplaceMutation.mutate,
    updateIntegration: updateIntegrationMutation.mutate,
    deleteIntegration: deleteIntegrationMutation.mutate,
    testConnection: testConnectionMutation.mutate,
    syncNow: syncNowMutation.mutate,

    // Loading states for actions
    isToggling: toggleChannelMutation.isPending,
    isConnecting: connectMarketplaceMutation.isPending,
    isUpdating: updateIntegrationMutation.isPending,
    isDeleting: deleteIntegrationMutation.isPending,
    isTesting: testConnectionMutation.isPending,
    isSyncing: syncNowMutation.isPending,

    // Helper functions
    isChannelEnabled,
    isChannelConnected,
    getIntegrationByMarketplace,
    getChannelStats,
    getRecentSyncLogs,
    canManageChannels
  };
};