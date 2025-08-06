
import { useState, useCallback } from 'react';

export interface Sale {
  id: string;
  sale_number?: string;
  customer_id?: string;
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  discount?: number;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useSalesManager = () => {
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({});

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      // Mock implementation
      setAllSales([]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createSale = useCallback(async (saleData: Partial<Sale>) => {
    setIsLoading(true);
    try {
      const newSale: Sale = {
        id: Date.now().toString(),
        status: 'pending',
        total_amount: 0,
        ...saleData
      };
      setAllSales(prev => [...prev, newSale]);
      return newSale;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar venda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSale = useCallback(async (id: string, saleData: Partial<Sale>) => {
    setIsLoading(true);
    try {
      setAllSales(prev => prev.map(s => s.id === id ? { ...s, ...saleData } : s));
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar venda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSale = useCallback(async (id: string, reason?: string) => {
    setIsLoading(true);
    try {
      setAllSales(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' as const } : s));
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar venda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchSales = useCallback(async (searchFilters: any) => {
    setFilters(searchFilters);
    // Mock search implementation
    return allSales;
  }, [allSales]);

  // Computed properties
  const sales = allSales;
  const totalSales = allSales.length;
  const isEmpty = allSales.length === 0;
  const isFiltered = Object.keys(filters).length > 0;
  const pendingSales = allSales.filter(s => s.status === 'pending');
  const completedSales = allSales.filter(s => s.status === 'completed');

  return {
    allSales,
    sales,
    totalSales,
    isLoading,
    error,
    filters,
    fetchSales,
    searchSales,
    createSale,
    updateSale,
    cancelSale,
    isEmpty,
    isFiltered,
    pendingSales,
    completedSales
  };
};
