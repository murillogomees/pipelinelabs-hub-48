
import { useState, useEffect } from 'react';
import { useProductsManager } from './useProductsManager';
import { useGenericManager } from './useGenericManager';

interface Sale {
  id: string;
  sale_number: string;
  customer_name?: string;
  total_amount: number;
  status: string;
  sale_date: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalSales: number;
  totalRevenue: number;
  isLoading: boolean;
  error: string | null;
}

export function useDashboardUnified() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    isLoading: true,
    error: null,
  });

  const productsManager = useProductsManager();
  const salesManager = useGenericManager<Sale>('sales');

  useEffect(() => {
    const loadData = async () => {
      try {
        setStats(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Fetch data
        await Promise.all([
          productsManager.fetchProducts(),
          salesManager.fetchItems(),
        ]);
        
      } catch (error: any) {
        setStats(prev => ({ ...prev, error: error.message }));
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Calculate stats when data changes
    const totalProducts = productsManager.allProducts.length;
    const lowStockProducts = productsManager.allProducts.filter(
      product => (product.stock_quantity || 0) <= (product.min_stock || 0)
    ).length;
    
    const totalSales = salesManager.items.length;
    const totalRevenue = salesManager.items.reduce(
      (sum, sale) => sum + (sale.total_amount || 0), 0
    );

    const isLoading = productsManager.isLoading || salesManager.loading;

    setStats({
      totalProducts,
      lowStockProducts,
      totalSales,
      totalRevenue,
      isLoading,
      error: productsManager.error || salesManager.error,
    });
  }, [
    productsManager.allProducts,
    productsManager.isLoading,
    productsManager.error,
    salesManager.items,
    salesManager.loading,
    salesManager.error,
  ]);

  return {
    stats,
    products: productsManager.allProducts,
    sales: salesManager.items,
    refreshData: async () => {
      await Promise.all([
        productsManager.refreshItems(),
        salesManager.fetchItems(),
      ]);
    },
  };
}
