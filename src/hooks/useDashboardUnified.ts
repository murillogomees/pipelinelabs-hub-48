
import { useState, useEffect, useCallback } from 'react';
import { useProductsManager } from './useProductsManager';
import { useCustomerManager } from './useCustomerManager';
import { useSalesManager } from './useSalesManager';
import { useCurrentCompany } from './useCurrentCompany';

interface DashboardData {
  // Produtos
  totalProducts: number;
  lowStockProducts: number;
  inactiveProducts: number;
  topProducts: any[];

  // Clientes
  totalCustomers: number;
  activeCustomers: number;
  recentCustomers: any[];

  // Vendas
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  pendingSales: number;
  completedSales: number;
  recentSales: any[];
  salesGrowth: number;

  // Geral
  lastUpdated: Date;
  isLoading: boolean;
}

export function useDashboardUnified() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProducts: 0,
    lowStockProducts: 0,
    inactiveProducts: 0,
    topProducts: [],
    totalCustomers: 0,
    activeCustomers: 0,
    recentCustomers: [],
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    pendingSales: 0,
    completedSales: 0,
    recentSales: [],
    salesGrowth: 0,
    lastUpdated: new Date(),
    isLoading: true
  });

  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;

  const {
    products,
    totalProducts,
    lowStockProducts,
    inactiveProducts,
    isLoading: productsLoading
  } = useProductsManager();

  const {
    customers,
    totalCustomers,
    activeCustomers,
    isLoading: customersLoading
  } = useCustomerManager();

  const {
    sales,
    totalSales,
    pendingSales,
    completedSales,
    isLoading: salesLoading,
    getSaleAnalytics
  } = useSalesManager();

  const updateDashboard = useCallback(async () => {
    if (!currentCompany?.id) return;

    try {
      // Calcular métricas de vendas
      const totalRevenue = completedSales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
      const averageTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

      // Buscar analytics de vendas
      const salesAnalytics = await getSaleAnalytics('month');
      
      // Calcular crescimento (comparação com período anterior)
      const currentMonthRevenue = totalRevenue;
      const salesGrowth = salesAnalytics?.totalRevenue ? 
        ((currentMonthRevenue - salesAnalytics.totalRevenue) / salesAnalytics.totalRevenue) * 100 : 0;

      // Produtos mais vendidos (últimas 10 vendas)
      const topProducts = products
        .filter(p => p.is_active)
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          stock: p.stock_quantity,
          price: p.price
        }));

      // Clientes recentes
      const recentCustomers = customers
        .filter(c => c.is_active)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: c.name,
          created_at: c.created_at
        }));

      // Vendas recentes - without customer property since it doesn't exist in the database
      const recentSales = sales
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          sale_number: s.sale_number,
          total_amount: s.total_amount,
          status: s.status,
          created_at: s.created_at,
          customer_id: s.customer_id
        }));

      setDashboardData({
        // Produtos
        totalProducts: totalProducts,
        lowStockProducts: lowStockProducts.length,
        inactiveProducts: inactiveProducts.length,
        topProducts,

        // Clientes
        totalCustomers: totalCustomers,
        activeCustomers: activeCustomers.length,
        recentCustomers,

        // Vendas
        totalSales: totalSales,
        totalRevenue,
        averageTicket,
        pendingSales: pendingSales.length,
        completedSales: completedSales.length,
        recentSales,
        salesGrowth,

        // Geral
        lastUpdated: new Date(),
        isLoading: productsLoading || customersLoading || salesLoading
      });

    } catch (error) {
      console.error('Error updating dashboard:', error);
      setDashboardData(prev => ({ ...prev, isLoading: false }));
    }
  }, [
    currentCompany?.id,
    products,
    totalProducts,
    lowStockProducts,
    inactiveProducts,
    customers,
    totalCustomers,
    activeCustomers,
    sales,
    totalSales,
    pendingSales,
    completedSales,
    productsLoading,
    customersLoading,
    salesLoading,
    getSaleAnalytics
  ]);

  // Atualizar dashboard quando dados mudarem
  useEffect(() => {
    updateDashboard();
  }, [updateDashboard]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      updateDashboard();
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [updateDashboard]);

  const refreshDashboard = useCallback(async () => {
    await updateDashboard();
  }, [updateDashboard]);

  return {
    dashboardData,
    refreshDashboard,
    isLoading: dashboardData.isLoading
  };
}
