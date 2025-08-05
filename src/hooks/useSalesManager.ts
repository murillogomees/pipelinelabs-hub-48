
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';
import { useCache } from './useCache';

// Simple sale data interface to avoid deep type instantiation
interface SimpleSaleData {
  id?: string;
  sale_number?: string;
  customer_id?: string;
  sale_type?: string;
  status?: string;
  total_amount: number;
  discount?: number;
  tax_amount?: number;
  payment_method?: string;
  payment_status?: string;
  notes?: string;
  sale_date?: string;
}

interface SearchFilters {
  query?: string;
  customer_id?: string;
  status?: string;
  payment_status?: string;
  sale_type?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export function useSalesManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simplify the cache usage
  const cacheKey = `sales-${currentCompany?.id}`;
  const { 
    data: salesData, 
    invalidateCache: invalidateSalesCache,
    updateCache: updateSalesCache,
    isLoading: isCacheLoading
  } = useCache({
    key: cacheKey,
    fetcher: async () => {
      if (!currentCompany?.id) return { sales: [], count: 0 };

      const { data, error, count } = await supabase
        .from('sales')
        .select('*', { count: 'exact' })
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        sales: data || [],
        count: count || 0
      };
    },
    ttl: 120000,
    enabled: !!currentCompany?.id
  });

  const sales = salesData?.sales || [];
  const totalSales = salesData?.count || 0;

  const createSale = useCallback(async (saleData: SimpleSaleData) => {
    setIsLoading(true);
    
    try {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }

      const insertData = {
        sale_number: saleData.sale_number,
        customer_id: saleData.customer_id,
        sale_type: saleData.sale_type,
        status: saleData.status,
        total_amount: saleData.total_amount,
        discount: saleData.discount,
        tax_amount: saleData.tax_amount,
        payment_method: saleData.payment_method,
        payment_status: saleData.payment_status,
        notes: saleData.notes,
        sale_date: saleData.sale_date || new Date().toISOString().split('T')[0],
        company_id: currentCompany.id
      };

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(insertData)
        .select()
        .single();

      if (saleError) throw saleError;

      await Promise.all([
        invalidateSalesCache(),
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      ]);

      toast({
        title: 'Sucesso',
        description: 'Venda criada com sucesso'
      });

      return sale;
    } catch (error: any) {
      console.error('Error creating sale:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar venda',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, invalidateSalesCache, queryClient, toast]);

  const updateSale = useCallback(async (saleId: string, saleData: Partial<SimpleSaleData>) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .update({
          ...saleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', saleId)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) throw error;

      if (salesData?.sales) {
        const updatedList = salesData.sales.map((s: any) => 
          s.id === saleId ? { ...s, ...data } : s
        );
        updateSalesCache({ ...salesData, sales: updatedList });
      }

      toast({
        title: 'Sucesso',
        description: 'Venda atualizada com sucesso'
      });

      return data;
    } catch (error: any) {
      console.error('Error updating sale:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar venda',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, salesData, updateSalesCache, toast]);

  const cancelSale = useCallback(async (saleId: string, reason?: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('sales')
        .update({ 
          status: 'cancelled',
          notes: reason ? `Cancelada: ${reason}` : 'Cancelada',
          updated_at: new Date().toISOString()
        })
        .eq('id', saleId)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;

      if (salesData?.sales) {
        const updatedList = salesData.sales.map((s: any) => 
          s.id === saleId ? { ...s, status: 'cancelled' } : s
        );
        updateSalesCache({ ...salesData, sales: updatedList });
      }

      toast({
        title: 'Sucesso',
        description: 'Venda cancelada com sucesso'
      });
    } catch (error: any) {
      console.error('Error cancelling sale:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cancelar venda',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, salesData, updateSalesCache, toast]);

  const getSaleAnalytics = useCallback(async (period: string) => {
    try {
      if (!currentCompany?.id) {
        return { totalRevenue: 0, totalSales: 0, averageTicket: 0, period };
      }

      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount, status')
        .eq('company_id', currentCompany.id)
        .eq('status', 'completed');

      if (!salesData) {
        return { totalRevenue: 0, totalSales: 0, averageTicket: 0, period };
      }

      const totalRevenue = salesData.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
      const totalSales = salesData.length;
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

      return {
        totalRevenue,
        totalSales,
        averageTicket,
        period
      };
    } catch (error) {
      console.error('Error fetching sale analytics:', error);
      return { totalRevenue: 0, totalSales: 0, averageTicket: 0, period };
    }
  }, [currentCompany?.id]);

  const searchSales = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const refreshSales = useCallback(async () => {
    await invalidateSalesCache();
  }, [invalidateSalesCache]);

  return {
    isLoading: isLoading || isCacheLoading,
    sales,
    totalSales,
    filters,
    page,
    pageSize,
    createSale,
    updateSale,
    cancelSale,
    searchSales,
    refreshSales,
    getSaleAnalytics,
    getSaleById: useCallback((id: string) => 
      sales.find((s: any) => s.id === id), [sales]
    ),
    pendingSales: sales.filter((s: any) => s.status === 'pending'),
    completedSales: sales.filter((s: any) => s.status === 'completed'),
    cancelledSales: sales.filter((s: any) => s.status === 'cancelled'),
    isEmpty: sales.length === 0,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof SearchFilters])
  };
}
