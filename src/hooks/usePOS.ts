import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface POSItem {
  product_id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export interface POSPayment {
  method: 'money' | 'pix' | 'card' | 'boleto';
  amount: number;
  details?: string;
}

export interface POSSale {
  id: string;
  company_id: string;
  customer_id?: string;
  sale_number: string;
  total_amount: number;
  discount: number;
  tax_amount: number;
  items: POSItem[];
  payments: POSPayment[];
  status: 'completed' | 'cancelled';
  receipt_printed: boolean;
  nfce_issued: boolean;
  nfce_key?: string;
  notes?: string;
  operator_id?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
  };
}

export function usePOSSales() {
  return useQuery({
    queryKey: ['pos-sales'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('pos_sales')
        .select(`
          *,
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as POSSale[];
    },
  });
}

export function useCreatePOSSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sale: Partial<POSSale>) => {
      // Gerar número da venda
      const { data: companyData } = await supabase.rpc('get_user_company_id');
      const { data: saleNumber } = await supabase.rpc('generate_pos_sale_number', {
        company_uuid: companyData
      });

      const { data, error } = await (supabase as any)
        .from('pos_sales')
        .insert([{
          ...sale,
          sale_number: saleNumber,
          company_id: companyData,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-sales'] });
      toast({
        title: 'Venda realizada',
        description: 'A venda foi registrada com sucesso.',
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

export function useUpdatePOSSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<POSSale> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('pos_sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-sales'] });
      toast({
        title: 'Venda atualizada',
        description: 'A venda foi atualizada com sucesso.',
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