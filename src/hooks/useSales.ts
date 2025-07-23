
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Sale {
  id: string;
  company_id: string;
  customer_id?: string;
  sale_number: string;
  sale_date: string;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  subtotal: number;
  discount?: number;
  shipping_cost?: number;
  total_amount: number;
  payment_method?: string;
  payment_terms?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
  };
}

export function useSales(options?: {
  status?: string;
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { status, page = 1, pageSize = 50, dateFrom, dateTo } = options || {};
  
  return useQuery({
    queryKey: ['sales', { status, page, pageSize, dateFrom, dateTo }],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(`
          id,
          company_id,
          customer_id,
          sale_number,
          sale_date,
          status,
          subtotal,
          discount,
          total_amount,
          payment_method,
          payment_terms,
          notes,
          created_at,
          updated_at,
          customers (
            name
          )
        `, { count: 'exact' });

      // Usar índices otimizados para filtros
      if (status) {
        query = query.eq('status', status);
      }
      
      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      
      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Ordenação usando índice idx_sales_created_at
      query = query.order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      return { 
        data: data as Sale[], 
        count: count || 0,
        hasMore: (count || 0) > to + 1
      };
    },
    staleTime: 30000, // Cache por 30 segundos
    gcTime: 300000, // 5 minutos
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sale: Partial<Sale>) => {
      const { data, error } = await (supabase as any)
        .from('sales')
        .insert([sale])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: 'Venda criada',
        description: 'A venda foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
