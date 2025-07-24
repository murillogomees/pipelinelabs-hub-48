import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceIntegration {
  id: string;
  company_id: string;
  marketplace: string;
  credentials: Record<string, any>;
  status: 'active' | 'inactive' | 'disconnected' | 'error';
  last_sync?: string;
  sync_status?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useMarketplaceIntegrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar integrações
  const { data: integrations, isLoading, error } = useQuery({
    queryKey: ['marketplace-integrations'],
    queryFn: async (): Promise<MarketplaceIntegration[]> => {
      const { data, error } = await supabase
        .from('marketplace_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching marketplace integrations:', error);
        throw error;
      }

      return data || [];
    },
  });

  // Atualizar status de integração
  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MarketplaceIntegration> }) => {
      const { data, error } = await supabase
        .from('marketplace_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-integrations'] });
      toast({
        title: "Integração atualizada",
        description: "A integração foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar integração",
        description: error.message || "Não foi possível atualizar a integração.",
        variant: "destructive",
      });
    },
  });

  // Sincronizar integração
  const syncIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      // Aqui você pode implementar a lógica de sincronização
      // Por enquanto, apenas atualiza o last_sync
      const { data, error } = await supabase
        .from('marketplace_integrations')
        .update({ 
          last_sync: new Date().toISOString(),
          sync_status: 'syncing'
        })
        .eq('id', integrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-integrations'] });
      toast({
        title: "Sincronização iniciada",
        description: "A sincronização foi iniciada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível iniciar a sincronização.",
        variant: "destructive",
      });
    },
  });

  return {
    integrations: integrations || [],
    isLoading,
    error,
    updateIntegration: updateIntegrationMutation.mutate,
    syncIntegration: syncIntegrationMutation.mutate,
    isUpdating: updateIntegrationMutation.isPending,
    isSyncing: syncIntegrationMutation.isPending,
  };
};