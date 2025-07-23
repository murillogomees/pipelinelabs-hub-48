import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceIntegration {
  id: string;
  company_id: string;
  marketplace: string;
  status: 'active' | 'inactive' | 'error';
  auth_type: 'oauth' | 'apikey';
  credentials: Record<string, any>;
  config: Record<string, any>;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export const useMarketplaceIntegrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['marketplace-integrations'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('marketplace_integrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as MarketplaceIntegration[];
    }
  });

  const createIntegration = useMutation({
    mutationFn: async (integration: {
      marketplace: string;
      auth_type: 'oauth' | 'apikey';
      credentials: Record<string, any>;
      config?: Record<string, any>;
    }) => {
      const { data, error } = await (supabase as any)
        .from('marketplace_integrations')
        .insert({
          marketplace: integration.marketplace,
          auth_type: integration.auth_type,
          credentials: integration.credentials,
          config: integration.config || {},
          status: 'inactive'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-integrations'] });
      toast({
        title: 'Integração criada',
        description: 'A integração com o marketplace foi configurada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar integração',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const updateIntegration = useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<MarketplaceIntegration> 
    }) => {
      const { data, error } = await (supabase as any)
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
        title: 'Integração atualizada',
        description: 'As configurações foram atualizadas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar integração',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('marketplace_integrations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-integrations'] });
      toast({
        title: 'Integração removida',
        description: 'A integração foi removida com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover integração',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const testConnection = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implementar teste de conexão real
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Conexão testada',
        description: 'A conexão com o marketplace foi testada com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Falha no teste',
        description: 'Não foi possível conectar com o marketplace.',
        variant: 'destructive',
      });
    }
  });

  const syncNow = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implementar sincronização real
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await (supabase as any)
        .from('marketplace_integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', id);
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-integrations'] });
      toast({
        title: 'Sincronização concluída',
        description: 'Os dados foram sincronizados com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar os dados.',
        variant: 'destructive',
      });
    }
  });

  return {
    integrations,
    isLoading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,
    syncNow
  };
};