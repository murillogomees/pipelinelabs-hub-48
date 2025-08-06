import { useCompanyCache } from './useCache';
import { CACHE_TTL } from '@/lib/cache/redis';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Hook para cache do dashboard
export function useCachedDashboard() {
  const { user } = useAuth();
  const companyId = user?.user_metadata?.company_id;
  
  return useCompanyCache({
    companyId,
    cacheType: 'dashboard',
    ttl: CACHE_TTL.DASHBOARD,
    fetcher: async () => {
      const [salesData, productsData, customersData, financialData] = await Promise.all([
        // Resumo de vendas
        supabase
          .from('sales')
          .select('total_amount, status, created_at')
          .eq('company_id', companyId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Produtos com baixo estoque
        supabase
          .from('products')
          .select('name, stock_quantity, min_stock')
          .eq('company_id', companyId)
          .lte('stock_quantity', 'min_stock')
          .limit(10),
        
        // Clientes recentes
        supabase
          .from('customers')
          .select('name, created_at')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Resumo financeiro
        supabase
          .from('accounts_receivable')
          .select('amount, status, due_date')
          .eq('company_id', companyId)
          .eq('status', 'pending')
      ]);
      
      return {
        sales: salesData.data || [],
        lowStockProducts: productsData.data || [],
        recentCustomers: customersData.data || [],
        pendingReceivables: financialData.data || []
      };
    },
    enabled: !!companyId
  });
}

// Hook para cache da lista de produtos
export function useCachedProductsList(search?: string, category?: string) {
  const { user } = useAuth();
  const companyId = user?.user_metadata?.company_id;
  
  return useCompanyCache({
    companyId,
    cacheType: 'products_list',
    ttl: CACHE_TTL.PRODUCTS_LIST,
    fetcher: async () => {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          stock_quantity,
          is_active,
          category_id,
          product_categories(name)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);
      
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      if (category) {
        query = query.eq('category_id', category);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
    search,
    category
  });
}

// Hook para cache dos top clientes
export function useCachedTopCustomers() {
  const { user } = useAuth();
  const companyId = user?.user_metadata?.company_id;
  
  return useCompanyCache({
    companyId,
    cacheType: 'top_customers',
    ttl: CACHE_TTL.REPORTS,
    fetcher: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          email,
          phone,
          sales!inner(total_amount)
        `)
        .eq('company_id', companyId)
        .order('sales.total_amount', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });
}

// Hook para cache dos produtos mais vendidos
export function useCachedTopProducts() {
  const { user } = useAuth();
  const companyId = user?.user_metadata?.company_id;
  
  return useCompanyCache({
    companyId,
    cacheType: 'top_products',
    ttl: CACHE_TTL.REPORTS,
    fetcher: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          sale_items!inner(quantity, total_price)
        `)
        .eq('company_id', companyId)
        .order('sale_items.quantity', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });
}

// Hook para cache do resumo financeiro
export function useCachedFinancialSummary() {
  const { user } = useAuth();
  const companyId = user?.user_metadata?.company_id;
  
  return useCompanyCache({
    companyId,
    cacheType: 'financial_summary',
    ttl: CACHE_TTL.FINANCIAL,
    fetcher: async () => {
      const [receivables, payables, sales] = await Promise.all([
        supabase
          .from('accounts_receivable')
          .select('amount, status, due_date')
          .eq('company_id', companyId),
        
        supabase
          .from('accounts_payable')
          .select('amount, status, due_date')
          .eq('company_id', companyId),
        
        supabase
          .from('sales')
          .select('total_amount, sale_date, status')
          .eq('company_id', companyId)
          .gte('sale_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);
      
      return {
        receivables: receivables.data || [],
        payables: payables.data || [],
        recentSales: sales.data || []
      };
    },
    enabled: !!companyId
  });
}

// Hook para cache de relatórios por período
export function useCachedReport(
  reportType: string,
  startDate: string,
  endDate: string,
  filters: Record<string, any> = {}
) {
  const { user } = useAuth();
  const companyId = user?.user_metadata?.company_id;
  
  return useCompanyCache({
    companyId,
    cacheType: 'report',
    ttl: CACHE_TTL.REPORTS,
    fetcher: async () => {
      // Implementar lógica específica baseada no tipo de relatório
      switch (reportType) {
        case 'sales':
          return await supabase
            .from('sales')
            .select('*')
            .eq('company_id', companyId)
            .gte('sale_date', startDate)
            .lte('sale_date', endDate);
        
        case 'products':
          return await supabase
            .from('products')
            .select('*')
            .eq('company_id', companyId);
        
        case 'financial':
          const [receivables, payables] = await Promise.all([
            supabase
              .from('accounts_receivable')
              .select('*')
              .eq('company_id', companyId)
              .gte('due_date', startDate)
              .lte('due_date', endDate),
            
            supabase
              .from('accounts_payable')
              .select('*')
              .eq('company_id', companyId)
              .gte('due_date', startDate)
              .lte('due_date', endDate)
          ]);
          
          return {
            receivables: receivables.data || [],
            payables: payables.data || []
          };
        
        default:
          throw new Error(`Tipo de relatório não suportado: ${reportType}`);
      }
    },
    enabled: !!companyId && !!reportType && !!startDate && !!endDate,
    reportType,
    startDate,
    endDate,
    filters: JSON.stringify(filters)
  });
}

// Hook para cache de informações públicas (categorias, planos)
export function useCachedPublicData(dataType: 'categories' | 'plans' | 'features') {
  return useCompanyCache({
    companyId: 'public', // Dados públicos
    cacheType: `catalog_${dataType}`,
    ttl: CACHE_TTL.CATALOG,
    fetcher: async () => {
      switch (dataType) {
        case 'categories':
          return await supabase
            .from('product_categories')
            .select('*')
            .order('name');
        
        case 'plans':
          return await supabase
            .from('plans')
            .select('*')
            .eq('active', true)
            .order('price');
        
        case 'features':
          // Implementar lógica para features/funcionalidades
          return [];
        
        default:
          throw new Error(`Tipo de dados públicos não suportado: ${dataType}`);
      }
    }
  });
}