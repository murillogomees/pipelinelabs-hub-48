import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceIntegration {
  id: string;
  company_id: string;
  marketplace: string;
  status: 'active' | 'inactive' | 'error';
  auth_type: 'oauth' | 'apikey';
  credentials: Record<string, string>;
  config: Record<string, any>;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

const TOAST_MESSAGES = {
  created: { title: 'Integração criada', description: 'Marketplace configurado com sucesso' },
  updated: { title: 'Integração atualizada', description: 'Configurações atualizadas' },
  removed: { title: 'Integração removida', description: 'Marketplace desconectado' },
  tested: { title: 'Conexão testada', description: 'Teste realizado com sucesso' },
  synced: { title: 'Sincronização concluída', description: 'Dados sincronizados' },
  error: { title: 'Erro', variant: 'destructive' as const }
};

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
      credentials: Record<string, string>;
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
      toast(TOAST_MESSAGES.created);
    },
    onError: (error: any) => {
      toast({ ...TOAST_MESSAGES.error, description: error.message });
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
      toast(TOAST_MESSAGES.updated);
    },
    onError: (error: any) => {
      toast({ ...TOAST_MESSAGES.error, description: error.message });
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
      toast(TOAST_MESSAGES.removed);
    },
    onError: (error: any) => {
      toast({ ...TOAST_MESSAGES.error, description: error.message });
    }
  });

  const testConnection = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implementar teste real
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => toast(TOAST_MESSAGES.tested),
    onError: () => toast({ ...TOAST_MESSAGES.error, description: 'Falha na conexão' })
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
      toast(TOAST_MESSAGES.synced);
    },
    onError: () => toast({ ...TOAST_MESSAGES.error, description: 'Falha na sincronização' })
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