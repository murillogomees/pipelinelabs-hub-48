import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export interface CompanyMarketplaceConfig {
  id: string;
  company_id: string;
  channel_name: string;
  is_enabled: boolean;
  global_config: any;
  webhook_config: any;
  api_limits: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useMarketplaceChannels = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os canais de marketplace
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

  // Buscar configurações da empresa atual
  const { data: companyConfigs, isLoading: configsLoading } = useQuery({
    queryKey: ['company-marketplace-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_marketplace_configs')
        .select('*');
      
      if (error) throw error;
      return data as CompanyMarketplaceConfig[];
    }
  });

  // Ativar/desativar canal para empresa (apenas admins)
  const toggleChannelMutation = useMutation({
    mutationFn: async ({ channelName, isEnabled }: { channelName: string; isEnabled: boolean }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) throw new Error('Usuário não autenticado');

      // Verificar se já existe configuração
      const { data: existing } = await supabase
        .from('company_marketplace_configs')
        .select('*')
        .eq('channel_name', channelName)
        .single();

      if (existing) {
        // Atualizar configuração existente
        const { data, error } = await supabase
          .from('company_marketplace_configs')
          .update({ is_enabled: isEnabled })
          .eq('channel_name', channelName)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Criar nova configuração
        const { data: userData } = await supabase.auth.getUser();
        const { data: userCompany } = await supabase
          .from('user_companies')
          .select('company_id')
          .eq('user_id', userData.user?.id)
          .single();

        if (!userCompany) throw new Error('Empresa não encontrada');

        const { data, error } = await supabase
          .from('company_marketplace_configs')
          .insert({
            company_id: userCompany.company_id,
            channel_name: channelName,
            is_enabled: isEnabled,
            created_by: userData.user?.id
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

  // Função para verificar se um canal está habilitado para a empresa
  const isChannelEnabled = (channelName: string) => {
    const config = companyConfigs?.find(c => c.channel_name === channelName);
    return config?.is_enabled || false;
  };

  // Função para verificar se usuário tem permissão para ativar canais
  const canManageChannels = async () => {
    try {
      const { data } = await supabase.rpc('is_super_admin');
      return data;
    } catch {
      return false;
    }
  };

  return {
    channels: channels || [],
    companyConfigs: companyConfigs || [],
    isLoading: channelsLoading || configsLoading,
    toggleChannel: toggleChannelMutation.mutate,
    isTogglingChannel: toggleChannelMutation.isPending,
    isChannelEnabled,
    canManageChannels
  };
};