import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string | null;
  supplier_name: string | null;
  order_date: string;
  delivery_date: string | null;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  items: any[];
  subtotal: number;
  discount: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  notes: string | null;
  internal_notes: string | null;
  created_by: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderFormData {
  supplier_id: string | null;
  supplier_name: string;
  order_date: string;
  delivery_date: string | null;
  status: string;
  items: any[];
  subtotal: number;
  discount: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  notes: string | null;
  internal_notes: string | null;
  company_id?: string;
}

export function usePurchaseOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchaseOrders, isLoading: loading, error } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown) as PurchaseOrder[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PurchaseOrderFormData) => {
      // Generate order number using SQL function
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_purchase_order_number' as any, { company_uuid: data.company_id || null });

      if (orderNumberError) throw orderNumberError;

      const { data: newOrder, error } = await supabase
        .from('purchase_orders' as any)
        .insert([{
          ...data,
          order_number: orderNumberData
        }])
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
      const { data: updatedOrder, error } = await supabase
        .from('purchase_orders' as any)
        .update(data)
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
        .from('purchase_orders' as any)
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