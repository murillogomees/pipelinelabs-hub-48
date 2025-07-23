import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceProductMapping {
  id: string;
  integration_id: string;
  product_id: string;
  marketplace_product_id: string;
  marketplace_sku: string | null;
  sync_status: 'pending' | 'synced' | 'error';
  stock_sync_enabled: boolean;
  price_sync_enabled: boolean;
  last_synced_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useMarketplaceProductMappings = (integrationId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mappings, isLoading } = useQuery({
    queryKey: ['marketplace-product-mappings', integrationId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('marketplace_product_mappings')
        .select(`
          *,
          products!inner(id, name, code, price, stock_quantity)
        `)
        .order('created_at', { ascending: false });

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as (MarketplaceProductMapping & { products: any })[];
    },
    enabled: true
  });

  const createMapping = useMutation({
    mutationFn: async (mapping: {
      integration_id: string;
      product_id: string;
      marketplace_product_id: string;
      marketplace_sku?: string;
      stock_sync_enabled?: boolean;
      price_sync_enabled?: boolean;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await (supabase as any)
        .from('marketplace_product_mappings')
        .insert({
          integration_id: mapping.integration_id,
          product_id: mapping.product_id,
          marketplace_product_id: mapping.marketplace_product_id,
          marketplace_sku: mapping.marketplace_sku,
          stock_sync_enabled: mapping.stock_sync_enabled ?? true,
          price_sync_enabled: mapping.price_sync_enabled ?? true,
          metadata: mapping.metadata || {},
          sync_status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-product-mappings'] });
      toast({
        title: 'Produto mapeado',
        description: 'O produto foi mapeado com o marketplace com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao mapear produto',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const updateMapping = useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<MarketplaceProductMapping> 
    }) => {
      const { data, error } = await (supabase as any)
        .from('marketplace_product_mappings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-product-mappings'] });
      toast({
        title: 'Mapeamento atualizado',
        description: 'As configurações do mapeamento foram atualizadas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar mapeamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const deleteMapping = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('marketplace_product_mappings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-product-mappings'] });
      toast({
        title: 'Mapeamento removido',
        description: 'O mapeamento foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover mapeamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    mappings,
    isLoading,
    createMapping,
    updateMapping,
    deleteMapping
  };
};