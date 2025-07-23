import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  created_at: string;
  products?: {
    name: string;
    code: string;
  };
}

export interface SalePayment {
  id: string;
  sale_id: string;
  payment_method: 'money' | 'pix' | 'card' | 'boleto';
  amount: number;
  details?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  company_id: string;
  customer_id?: string;
  sale_number: string;
  sale_date: string;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  discount?: number;
  total_amount: number;
  payment_method?: string;
  notes?: string;
  sale_type: 'traditional' | 'pos';
  operator_id?: string;
  nfce_number?: string;
  receipt_printed?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
  };
  sale_items?: SaleItem[];
  sale_payments?: SalePayment[];
}

export interface CreateSaleData {
  customer_id?: string;
  sale_type: 'traditional' | 'pos';
  discount?: number;
  total_amount: number;
  payment_method?: string;
  notes?: string;
  operator_id?: string;
  items: Omit<SaleItem, 'id' | 'sale_id' | 'created_at'>[];
  payments?: Omit<SalePayment, 'id' | 'sale_id' | 'created_at'>[];
}

export function useSales(options?: {
  status?: string;
  saleType?: 'traditional' | 'pos';
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { 
    status, 
    saleType, 
    page = 1, 
    pageSize = 50, 
    dateFrom, 
    dateTo
  } = options || {};
  
  return useQuery({
    queryKey: ['sales', { status, saleType, page, pageSize, dateFrom, dateTo }],
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
          discount,
          total_amount,
          payment_method,
          notes,
          sale_type,
          operator_id,
          nfce_number,
          receipt_printed,
          is_active,
          created_at,
          updated_at,
          customers (
            name
          )
        `, { count: 'exact' });

      // Filtros
      query = query.eq('is_active', true);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (saleType) {
        query = query.eq('sale_type', saleType);
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

      // Ordenação
      query = query.order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      return { 
        data: data as Sale[], 
        count: count || 0,
        hasMore: (count || 0) > to + 1
      };
    },
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (
            name,
            document,
            email,
            phone
          ),
          sale_items (
            id,
            sale_id,
            product_id,
            quantity,
            unit_price,
            discount,
            total_price,
            created_at,
            products (
              name,
              code
            )
          ),
          sale_payments (
            id,
            sale_id,
            payment_method,
            amount,
            details,
            created_at
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as Sale;
    },
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (saleData: CreateSaleData) => {
      // Gerar número da venda
      const { data: companyId } = await supabase.rpc('get_user_company_id');
      const { data: saleNumber } = await supabase.rpc('generate_sale_number', {
        company_uuid: companyId,
        sale_type_param: saleData.sale_type
      });

      // Criar venda
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          company_id: companyId,
          customer_id: saleData.customer_id,
          sale_number: saleNumber,
          sale_date: new Date().toISOString().split('T')[0],
          status: 'pending',
          discount: saleData.discount || 0,
          total_amount: saleData.total_amount,
          payment_method: saleData.payment_method,
          notes: saleData.notes,
          sale_type: saleData.sale_type,
          operator_id: saleData.operator_id,
        }])
        .select()
        .single();
      
      if (saleError) throw saleError;

      // Criar itens da venda
      if (saleData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(
            saleData.items.map(item => ({
              sale_id: sale.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              discount: item.discount,
              total_price: item.total_price,
            }))
          );
        
        if (itemsError) throw itemsError;
      }

      // Criar pagamentos da venda
      if (saleData.payments && saleData.payments.length > 0) {
        const { error: paymentsError } = await supabase
          .from('sale_payments')
          .insert(
            saleData.payments.map(payment => ({
              sale_id: sale.id,
              payment_method: payment.payment_method,
              amount: payment.amount,
              details: payment.details,
            }))
          );
        
        if (paymentsError) throw paymentsError;
      }

      return sale;
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

export function useUpdateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sale> & { id: string }) => {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
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

export function useDeleteSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: 'Venda excluída',
        description: 'A venda foi excluída com sucesso.',
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

// Hook específico para vendas PDV (compatibilidade)
export function usePOSSales() {
  return useSales({ saleType: 'pos' });
}

export function useCreatePOSSale() {
  const createSale = useCreateSale();
  
  return {
    ...createSale,
    mutateAsync: async (posData: any) => {
      const saleData: CreateSaleData = {
        customer_id: posData.customer_id,
        sale_type: 'pos',
        discount: posData.discount || 0,
        total_amount: posData.total_amount,
        notes: posData.notes,
        operator_id: posData.operator_id,
        items: posData.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0,
          total_price: item.total_price,
        })),
        payments: posData.payments?.map((payment: any) => ({
          payment_method: payment.method,
          amount: payment.amount,
          details: payment.details,
        })),
      };
      
      return createSale.mutateAsync(saleData);
    }
  };
}