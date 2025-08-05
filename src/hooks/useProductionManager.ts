import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';
import { useCache } from './useCache';

interface ProductionMetrics {
  activeOrders: number;
  completedToday: number;
  efficiency: number;
  alerts: any[];
}

export function useProductionManager() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cache para métricas de produção
  const { 
    data: metrics,
    invalidateCache: invalidateMetricsCache 
  } = useCache({
    key: `production-metrics-${currentCompany?.id}`,
    fetcher: async () => {
      if (!currentCompany?.id) return null;
      
      const { data, error } = await supabase.functions.invoke('production-metrics', {
        body: { companyId: currentCompany.id }
      });

      if (error) throw error;
      return data as ProductionMetrics;
    },
    ttl: 60000, // 1 minuto
    enabled: !!currentCompany?.id
  });

  const createProductionOrder = useCallback(async (orderData: any) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('production_orders')
        .insert({
          ...orderData,
          company_id: currentCompany?.id
        })
        .select()
        .single();

      if (error) throw error;

      await Promise.all([
        invalidateMetricsCache(),
        queryClient.invalidateQueries({ queryKey: ['production'] })
      ]);

      toast({
        title: 'Sucesso',
        description: 'Ordem de produção criada'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, invalidateMetricsCache, queryClient, toast]);

  return {
    isLoading,
    metrics,
    createProductionOrder,
    refreshMetrics: invalidateMetricsCache,
    currentCompany
  };
}