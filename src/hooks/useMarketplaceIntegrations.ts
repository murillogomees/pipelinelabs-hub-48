import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('marketplace_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching integrations:', error);
        return;
      }

      setIntegrations((data as MarketplaceIntegration[]) || []);
    } catch (error: any) {
      console.error('Failed to fetch marketplace integrations:', error);
      toast({
        title: "Erro ao carregar integrações",
        description: error.message || "Não foi possível carregar as integrações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateIntegration = async (id: string, updates: Partial<MarketplaceIntegration>) => {
    try {
      const { error } = await supabase
        .from('marketplace_integrations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setIntegrations(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );
      
      toast({
        title: "Integração atualizada",
        description: "A integração foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar integração",
        description: error.message || "Não foi possível atualizar a integração.",
        variant: "destructive",
      });
    }
  };

  const syncIntegration = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_integrations')
        .update({
          last_sync: new Date().toISOString(),
          sync_status: 'syncing',
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId);

      if (error) throw error;

      setIntegrations(prev => 
        prev.map(item => 
          item.id === integrationId 
            ? { ...item, last_sync: new Date().toISOString(), sync_status: 'syncing' }
            : item
        )
      );
      
      toast({
        title: "Sincronização iniciada",
        description: "A sincronização foi iniciada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível iniciar a sincronização.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return {
    integrations,
    updateIntegration,
    syncIntegration,
    fetchIntegrations,
    isLoading,
    isUpdating: false,
    isSyncing: false,
  };
};