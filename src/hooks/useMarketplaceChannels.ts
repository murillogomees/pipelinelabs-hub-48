import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceChannel {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMarketplaceChannelData {
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  status?: boolean;
}

export interface UpdateMarketplaceChannelData extends Partial<CreateMarketplaceChannelData> {
  id: string;
}

export const useMarketplaceChannels = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os canais
  const { data: channels, isLoading, error } = useQuery({
    queryKey: ['marketplace-channels'],
    queryFn: async (): Promise<MarketplaceChannel[]> => {
      const { data, error } = await supabase
        .from('marketplace_channels')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching marketplace channels:', error);
        throw error;
      }

      return data || [];
    },
  });

  // Criar canal
  const createChannelMutation = useMutation({
    mutationFn: async (channelData: CreateMarketplaceChannelData): Promise<MarketplaceChannel> => {
      const { data, error } = await supabase
        .from('marketplace_channels')
        .insert([channelData])
        .select()
        .single();

      if (error) {
        console.error('Error creating marketplace channel:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-channels'] });
      toast({
        title: "Canal criado",
        description: "O canal do marketplace foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating channel:', error);
      toast({
        title: "Erro ao criar canal",
        description: error.message || "Não foi possível criar o canal.",
        variant: "destructive",
      });
    },
  });

  // Atualizar canal
  const updateChannelMutation = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateMarketplaceChannelData): Promise<MarketplaceChannel> => {
      const { data, error } = await supabase
        .from('marketplace_channels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating marketplace channel:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-channels'] });
      toast({
        title: "Canal atualizado",
        description: "O canal do marketplace foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating channel:', error);
      toast({
        title: "Erro ao atualizar canal",
        description: error.message || "Não foi possível atualizar o canal.",
        variant: "destructive",
      });
    },
  });

  // Deletar canal
  const deleteChannelMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('marketplace_channels')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting marketplace channel:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-channels'] });
      toast({
        title: "Canal removido",
        description: "O canal do marketplace foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting channel:', error);
      toast({
        title: "Erro ao remover canal",
        description: error.message || "Não foi possível remover o canal.",
        variant: "destructive",
      });
    },
  });

  // Alternar status do canal
  const toggleChannelStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }): Promise<MarketplaceChannel> => {
      const { data, error } = await supabase
        .from('marketplace_channels')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling channel status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-channels'] });
      toast({
        title: "Status alterado",
        description: `Canal ${data.status ? 'ativado' : 'desativado'} com sucesso.`,
      });
    },
    onError: (error: any) => {
      console.error('Error toggling status:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Não foi possível alterar o status do canal.",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    channels: channels || [],
    isLoading,
    error,

    // Mutations
    createChannel: createChannelMutation.mutate,
    updateChannel: updateChannelMutation.mutate,
    deleteChannel: deleteChannelMutation.mutate,
    toggleChannelStatus: toggleChannelStatusMutation.mutate,

    // Mutation states
    isCreating: createChannelMutation.isPending,
    isUpdating: updateChannelMutation.isPending,
    isDeleting: deleteChannelMutation.isPending,
    isTogglingStatus: toggleChannelStatusMutation.isPending,
  };
};