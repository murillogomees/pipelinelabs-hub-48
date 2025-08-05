
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
  items?: SaleItemData[];
}

interface SaleItemData {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount?: number;
  product?: {
    name: string;
    code: string;
  };
}

interface SaleAnalytics {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  topProducts: any[];
  topCustomers: any[];
  salesByPeriod: any[];
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

  // Cache para lista de vendas com filtros
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
        .select(`
          *,
          customer:customers(name),
          sale_items(
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            product:products(name, code)
          )
        `, { count: 'exact' })
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (filters.query) {
        query = query.or(`sale_number.ilike.%${filters.query}%`);
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
    ttl: 120000, // 2 minutos (vendas são mais dinâmicas)
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

      // Gerar número da venda se não fornecido
      if (!saleData.sale_number) {
        const { data: saleNumber } = await supabase.rpc('generate_sale_number', {
          company_uuid: currentCompany.id,
          sale_type_param: saleData.sale_type
        });
        saleData.sale_number = saleNumber;
      }

      const { items, ...saleDataWithoutItems } = saleData;

      // Criar venda
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          ...saleDataWithoutItems,
          company_id: currentCompany.id,
          sale_date: saleData.sale_date || new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Criar itens da venda se fornecidos
      if (items && items.length > 0) {
        const saleItems = items.map(item => ({
          ...item,
          sale_id: sale.id,
          company_id: currentCompany.id
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);

        if (itemsError) throw itemsError;

        // Atualizar estoque dos produtos
        for (const item of items) {
          await supabase.rpc('register_stock_movement', {
            p_product_id: item.product_id,
            p_movement_type: 'saida',
            p_quantity: item.quantity,
            p_reference_type: 'sale',
            p_reference_id: sale.id
          });
        }
      }

      // Invalidar caches relacionados
      await Promise.all([
        invalidateSalesCache(),
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }) // Por causa do estoque
      ]);

      toast({
        title: 'Sucesso',
        description: 'Venda criada com sucesso'
      });

      return { ...sale, sale_items: items };
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
      const { items, ...saleDataWithoutItems } = saleData;

      const { data, error } = await supabase
        .from('sales')
        .update({
          ...saleDataWithoutItems,
          updated_at: new Date().toISOString()
        })
        .eq('id', saleId)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar cache local
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
      // Buscar itens da venda para reverter estoque
      const { data: saleItems } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', saleId);

      // Cancelar venda
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

      // Reverter estoque
      if (saleItems) {
        for (const item of saleItems) {
          await supabase.rpc('register_stock_movement', {
            p_product_id: item.product_id,
            p_movement_type: 'entrada',
            p_quantity: item.quantity,
            p_reference_type: 'sale_cancellation',
            p_reference_id: saleId,
            p_reason: 'Reversão por cancelamento de venda'
          });
        }
      }

      // Atualizar cache local
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

  const getSaleAnalytics = useCallback(async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<SaleAnalytics | null> => {
    try {
      if (!currentCompany?.id) return null;

      const periodMap = {
        day: '1 day',
        week: '7 days',
        month: '30 days',
        year: '1 year'
      };

      const [salesData, topProductsData, topCustomersData] = await Promise.all([
        supabase
          .from('sales')
          .select('total_amount, created_at')
          .eq('company_id', currentCompany.id)
          .eq('status', 'completed')
          .gte('created_at', new Date(Date.now() - 
            (period === 'day' ? 86400000 :
             period === 'week' ? 604800000 :
             period === 'month' ? 2592000000 : 31536000000)
          ).toISOString()),
        
        supabase
          .from('sale_items')
          .select(`
            product_id,
            quantity,
            total_price,
            product:products(name)
          `)
          .eq('company_id', currentCompany.id)
          .order('quantity', { ascending: false })
          .limit(10),
        
        supabase
          .from('sales')
          .select(`
            customer_id,
            total_amount,
            customer:customers(name)
          `)
          .eq('company_id', currentCompany.id)
          .eq('status', 'completed')
          .order('total_amount', { ascending: false })
          .limit(10)
      ]);

      const totalSales = salesData.data?.length || 0;
      const totalRevenue = salesData.data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

      return {
        totalSales,
        totalRevenue,
        averageTicket,
        topProducts: topProductsData.data || [],
        topCustomers: topCustomersData.data || [],
        salesByPeriod: salesData.data || []
      };
    } catch (error) {
      console.error('Error fetching sale analytics:', error);
      return null;
    }
  }, [currentCompany?.id]);

  const searchSales = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset para primeira página
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const refreshSales = useCallback(async () => {
    await invalidateSalesCache();
  }, [invalidateSalesCache]);

  // Auto-refresh a cada 2 minutos
  useEffect(() => {
    if (!currentCompany?.id) return;

    const interval = setInterval(() => {
      refreshSales();
    }, 120000);

    return () => clearInterval(interval);
  }, [currentCompany?.id, refreshSales]);

  return {
    // Estados
    isLoading: isLoading || isCacheLoading,
    sales,
    totalSales,
    filters,
    page,
    pageSize,

    // Funções principais
    createSale,
    updateSale,
    cancelSale,
    searchSales,
    loadMore,

    // Analytics
    getSaleAnalytics,
    refreshSales,

    // Utilitários
    getSaleById: useCallback((id: string) => 
      sales.find(s => s.id === id), [sales]
    ),

    // Estatísticas
    hasMorePages: sales.length < totalSales,
    currentPage: page,
    totalPages: Math.ceil(totalSales / pageSize),

    // Filtros auxiliares
    pendingSales: sales.filter(s => s.status === 'pending'),
    completedSales: sales.filter(s => s.status === 'completed'),
    cancelledSales: sales.filter(s => s.status === 'cancelled'),

    // Status
    isEmpty: sales.length === 0,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof SearchFilters])
  };
}
