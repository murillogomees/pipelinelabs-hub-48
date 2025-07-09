
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

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Sale[];
    },
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sale: Partial<Sale>) => {
      const { data, error } = await supabase
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
