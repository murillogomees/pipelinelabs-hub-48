import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook otimizado para dashboard com consultas eficientes usando índices
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      // Consultas paralelas usando os índices criados
      const [
        salesStats,
        ordersStats, 
        stockStats,
        invoicesStats,
        accountsStats
      ] = await Promise.all([
        // Vendas do mês atual - usa idx_sales_company_created_at
        supabase
          .from('sales')
          .select('total_amount, status')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .eq('status', 'approved'),

        // Pedidos pendentes - usa idx_sales_company_status
        supabase
          .from('sales')
          .select('id, total_amount')
          .eq('status', 'pending'),

        // Produtos com estoque baixo - usa idx_products_company_stock
        supabase
          .from('products')
          .select('id, name, stock_quantity, min_stock')
          .eq('is_active', true)
          .filter('stock_quantity', 'lte', 'min_stock'),

        // Notas fiscais emitidas no mês - usa idx_invoices_company_created_at
        supabase
          .from('invoices')
          .select('id, total_amount, status')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

        // Contas a receber vencidas - usa idx_accounts_receivable_company_due_date
        supabase
          .from('accounts_receivable')
          .select('id, amount, description')
          .eq('status', 'pending')
          .lt('due_date', new Date().toISOString().split('T')[0])
      ]);

      return {
        salesMonthly: salesStats.data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0,
        salesCount: salesStats.data?.length || 0,
        pendingOrders: ordersStats.data?.length || 0,
        pendingOrdersValue: ordersStats.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        lowStockProducts: stockStats.data?.length || 0,
        invoicesIssued: invoicesStats.data?.length || 0,
        invoicesValue: invoicesStats.data?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0,
        overdueReceivables: accountsStats.data?.length || 0,
        overdueReceivablesValue: accountsStats.data?.reduce((sum, acc) => sum + Number(acc.amount), 0) || 0,
        lowStockItems: stockStats.data || []
      };
    },
    staleTime: 60000, // Cache por 1 minuto
    gcTime: 300000, // 5 minutos
  });
}

// Hook simplificado para listagens com paginação
export function useOptimizedProducts(filters?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: ['products', 'optimized', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%, code.ilike.%${filters.search}%`);
      }

      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }

      query = query.order('name');
      
      const { data, error, count } = await query;
      if (error) throw error;
      
      return { data: data || [], count: count || 0 };
    },
    staleTime: 60000,
    gcTime: 300000,
  });
}

export function useOptimizedCustomers(filters?: { search?: string; status?: boolean }) {
  return useQuery({
    queryKey: ['customers', 'optimized', filters],
    queryFn: async () => {
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%, document.ilike.%${filters.search}%`);
      }

      if (filters?.status !== undefined) {
        query = query.eq('is_active', filters.status);
      }

      query = query.order('name');
      
      const { data, error, count } = await query;
      if (error) throw error;
      
      return { data: data || [], count: count || 0 };
    },
    staleTime: 60000,
    gcTime: 300000,
  });
}

// Hook para relatórios usando índices otimizados
export function useReportData(reportType: string, filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['reports', reportType, filters],
    queryFn: async () => {
      switch (reportType) {
        case 'sales_by_period':
          return await supabase
            .from('sales')
            .select('sale_date, total_amount, status')
            .gte('sale_date', filters?.startDate)
            .lte('sale_date', filters?.endDate)
            .eq('status', 'approved')
            .order('sale_date', { ascending: true });

        case 'top_products':
          // Implementação alternativa sem RPC por enquanto
          return await supabase
            .from('sale_items')
            .select(`
              product_id,
              quantity,
              products(name, code)
            `)
            .order('quantity', { ascending: false })
            .limit(filters?.limit || 10);

        case 'customer_analysis':
          return await supabase
            .from('customers')
            .select(`
              id, name, created_at,
              sales!inner(total_amount)
            `)
            .gte('sales.created_at', filters?.startDate)
            .lte('sales.created_at', filters?.endDate);

        default:
          throw new Error('Tipo de relatório não suportado');
      }
    },
    staleTime: 120000, // Cache por 2 minutos
    gcTime: 600000, // 10 minutos
    enabled: !!reportType,
  });
}

// Hook para busca global otimizada
export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const [customers, products, sales] = await Promise.all([
        // Busca em clientes usando índice idx_customers_name_search
        supabase
          .from('customers')
          .select('id, name, document, email')
          .or(`name.ilike.%${query}%, document.ilike.%${query}%, email.ilike.%${query}%`)
          .eq('is_active', true)
          .limit(5),

        // Busca em produtos usando índice idx_products_name_search
        supabase
          .from('products')
          .select('id, name, code, barcode')
          .or(`name.ilike.%${query}%, code.ilike.%${query}%, barcode.ilike.%${query}%`)
          .eq('is_active', true)
          .limit(5),

        // Busca em vendas usando índice idx_sales_sale_number
        supabase
          .from('sales')
          .select('id, sale_number, total_amount, status')
          .ilike('sale_number', `%${query}%`)
          .limit(5)
      ]);

      return {
        customers: customers.data || [],
        products: products.data || [],
        sales: sales.data || []
      };
    },
    staleTime: 30000,
    gcTime: 300000,
    enabled: query.length >= 2,
  });
}