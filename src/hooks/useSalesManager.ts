
import { useGenericManager } from './useGenericManager';
import { useState, useCallback, useMemo } from 'react';

export interface Sale {
  id: string;
  sale_number: string;
  customer_name?: string;
  customer_id?: string;
  total_amount: number;
  discount?: number;
  status: string;
  sale_date: string;
  payment_method?: string;
  notes?: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface SaleFilters {
  searchTerm: string;
  status?: 'all' | 'pending' | 'completed' | 'cancelled';
  dateRange?: { start: string; end: string };
}

export function useSalesManager() {
  const genericManager = useGenericManager<Sale>('sales');
  const [filters, setFilters] = useState<SaleFilters>({
    searchTerm: '',
    status: 'all'
  });

  const searchSales = useCallback((newFilters: Partial<SaleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const cancelSale = useCallback(async (saleId: string, reason?: string) => {
    try {
      await genericManager.updateItem(saleId, { 
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
      });
    } catch (error) {
      throw error;
    }
  }, [genericManager.updateItem]);

  const filteredSales = useMemo(() => {
    let filtered = genericManager.items;
    
    // Filter by search term
    if (filters.searchTerm) {
      filtered = filtered.filter(sale => 
        sale.sale_number.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (sale.customer_name && sale.customer_name.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(sale => sale.status === filters.status);
    }

    return filtered;
  }, [genericManager.items, filters]);

  const pendingSales = useMemo(() => {
    return genericManager.items.filter(sale => sale.status === 'pending');
  }, [genericManager.items]);

  const completedSales = useMemo(() => {
    return genericManager.items.filter(sale => sale.status === 'completed');
  }, [genericManager.items]);

  const totalSales = genericManager.items.length;
  const isEmpty = filteredSales.length === 0;
  const isFiltered = filters.searchTerm !== '' || filters.status !== 'all';

  return {
    sales: filteredSales,
    loading: genericManager.loading,
    isLoading: genericManager.isLoading,
    error: genericManager.error,
    createSale: genericManager.createItem,
    updateSale: genericManager.updateItem,
    deleteSale: genericManager.deleteItem,
    cancelSale,
    fetchSales: genericManager.fetchItems,
    allSales: genericManager.items,
    totalSales,
    isEmpty,
    isFiltered,
    pendingSales,
    completedSales,
    filters,
    searchSales,
  };
}
