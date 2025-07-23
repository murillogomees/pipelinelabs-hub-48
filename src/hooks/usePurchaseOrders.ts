import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PurchaseOrder, PurchaseOrderFormData, OrderItem } from '@/components/Purchases/types';

export function usePurchaseOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchaseOrders, isLoading: loading, error } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async (): Promise<PurchaseOrder[]> => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as any[]).map(item => ({
        ...item,
        tax_amount: item.tax_amount || 0,
        shipping_cost: item.shipping_cost || 0,
        internal_notes: item.internal_notes || '',
        items: typeof item.items === 'string' ? JSON.parse(item.items) : (Array.isArray(item.items) ? item.items : [])
      })) as PurchaseOrder[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PurchaseOrderFormData) => {
      // Generate order number using SQL function
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_purchase_order_number' as any, { 
          company_uuid: data.company_id 
        });

      if (orderNumberError) throw orderNumberError;

      const insertData = {
        order_number: orderNumberData as string,
        supplier_id: data.supplier_id,
        supplier_name: data.supplier_name,
        order_date: data.order_date,
        delivery_date: data.delivery_date || null,
        status: data.status,
        items: JSON.stringify(data.items),
        subtotal: data.subtotal,
        discount: data.discount,
        tax_amount: data.tax_amount,
        shipping_cost: data.shipping_cost,
        total_amount: data.total_amount,
        notes: data.notes || null,
        internal_notes: data.internal_notes || null,
        company_id: data.company_id
      };

      const { data: newOrder, error } = await supabase
        .from('purchase_orders')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({
        title: "Sucesso",
        description: "Pedido de compra criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar pedido de compra",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PurchaseOrderFormData> }) => {
      const updateData = {
        ...data,
        items: data.items ? JSON.stringify(data.items) : undefined,
      };

      const { data: updatedOrder, error } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({
        title: "Sucesso",
        description: "Pedido de compra atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar pedido:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar pedido de compra",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({
        title: "Sucesso",
        description: "Pedido de compra excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir pedido:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir pedido de compra",
        variant: "destructive",
      });
    },
  });

  return {
    purchaseOrders,
    loading,
    error,
    createPurchaseOrder: createMutation.mutate,
    updatePurchaseOrder: (id: string, data: Partial<PurchaseOrderFormData>) => 
      updateMutation.mutate({ id, data }),
    deletePurchaseOrder: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}