
import { useGenericManager } from './useGenericManager';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useCallback } from 'react';

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
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;

  const baseManager = useGenericManager<any, SimpleSaleData, Partial<SimpleSaleData>, SearchFilters>({
    tableName: 'sales',
    queryKey: 'sales',
    orderBy: { column: 'created_at', ascending: false },
    transformCreate: (data: SimpleSaleData, companyId: string) => ({
      sale_number: data.sale_number,
      customer_id: data.customer_id,
      sale_type: data.sale_type,
      status: data.status,
      total_amount: data.total_amount,
      discount: data.discount,
      tax_amount: data.tax_amount,
      payment_method: data.payment_method,
      payment_status: data.payment_status,
      notes: data.notes,
      sale_date: data.sale_date || new Date().toISOString().split('T')[0],
      company_id: companyId
    })
  });

  const cancelSale = useCallback(async (saleId: string, reason?: string) => {
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

      await baseManager.refreshItems();
    } catch (error: any) {
      console.error('Error cancelling sale:', error);
      throw error;
    }
  }, [currentCompany?.id, baseManager.refreshItems]);

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

      return { totalRevenue, totalSales, averageTicket, period };
    } catch (error) {
      console.error('Error fetching sale analytics:', error);
      return { totalRevenue: 0, totalSales: 0, averageTicket: 0, period };
    }
  }, [currentCompany?.id]);

  return {
    ...baseManager,
    sales: baseManager.items,
    createSale: baseManager.createItem,
    updateSale: baseManager.updateItem,
    cancelSale,
    searchSales: baseManager.searchItems,
    refreshSales: baseManager.refreshItems,
    getSaleAnalytics,
    getSaleById: baseManager.getItemById,
    pendingSales: baseManager.items.filter((s: any) => s.status === 'pending'),
    completedSales: baseManager.items.filter((s: any) => s.status === 'completed'),
    cancelledSales: baseManager.items.filter((s: any) => s.status === 'cancelled'),
    totalSales: baseManager.totalItems,
    page: 1,
    pageSize: 50
  };
}
