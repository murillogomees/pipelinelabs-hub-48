
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';
import { useCache } from './useCache';

interface SaleData {
  id?: string;
  sale_number?: string;
  customer_id?: string;
  sale_type: 'traditional' | 'pos';
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  discount_amount?: number;
  tax_amount?: number;
  payment_method?: string;
  payment_status?: 'pending' | 'paid' | 'partial' | 'cancelled';
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

  const cacheKey = `sales-${currentCompany?.id}-${JSON.stringify(filters)}-${page}`;
  const { 
    data: salesData, 
    invalidateCache: invalidateSalesCache,
    updateCache: updateSalesCache,
    isLoading: isCacheLoading
  } = useCache({
    key: cacheKey,
    fetcher: async () => {
      if (!currentCompany?.id) return { sales: [], count: 0 };

      let query = supabase
        .from('sales')
        .select('*', { count: 'exact' })
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (filters.query) {
        query = query.ilike('sale_number', `%${filters.query}%`);
      }

      if (filters.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters.sale_type) {
        query = query.eq('sale_type', filters.sale_type);
      }

      if (filters.date_from) {
        query = query.gte('sale_date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('sale_date', filters.date_to);
      }

      if (filters.min_amount !== undefined) {
        query = query.gte('total_amount', filters.min_amount);
      }

      if (filters.max_amount !== undefined) {
        query = query.lte('total_amount', filters.max_amount);
      }

      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

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

  const createSale = useCallback(async (saleData: SaleData): Promise<any> => {
    setIsLoading(true);
    
    try {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }

      // Preparar dados baseados no schema real
      const insertData = {
        sale_number: saleData.sale_number,
        customer_id: saleData.customer_id,
        sale_type: saleData.sale_type,
        status: saleData.status,
        total_amount: saleData.total_amount,
        discount_amount: saleData.discount_amount,
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

  const updateSale = useCallback(async (saleId: string, saleData: Partial<SaleData>): Promise<any> => {
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
        const updatedList = salesData.sales.map(s => 
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

  const cancelSale = useCallback(async (saleId: string, reason?: string): Promise<void> => {
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
        const updatedList = salesData.sales.map(s => 
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

  const searchSales = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const refreshSales = useCallback(async () => {
    await invalidateSalesCache();
  }, [invalidateSalesCache]);

  useEffect(() => {
    if (!currentCompany?.id) return;

    const interval = setInterval(() => {
      refreshSales();
    }, 120000);

    return () => clearInterval(interval);
  }, [currentCompany?.id, refreshSales]);

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
    loadMore,
    refreshSales,
    getSaleById: useCallback((id: string) => 
      sales.find(s => s.id === id), [sales]
    ),
    hasMorePages: sales.length < totalSales,
    currentPage: page,
    totalPages: Math.ceil(totalSales / pageSize),
    pendingSales: sales.filter(s => s.status === 'pending'),
    completedSales: sales.filter(s => s.status === 'completed'),
    cancelledSales: sales.filter(s => s.status === 'cancelled'),
    isEmpty: sales.length === 0,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof SearchFilters])
  };
}
