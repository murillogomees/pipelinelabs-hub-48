import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type ProductionOrder = Tables<'production_orders'>;
export type ProductionOrderWithProduct = ProductionOrder & {
  products?: Pick<Tables<'products'>, 'id' | 'name' | 'code'>;
};

export interface CreateProductionOrderData {
  order_number: string;
  product_id: string;
  quantity: number;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
}

export function useProductionOrders() {
  const [orders, setOrders] = useState<ProductionOrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('production_orders')
        .select(`
          *,
          products:product_id (id, name, code)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar ordens de produção:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar ordens de produção',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateProductionOrderData) => {
    try {
      const { data, error } = await (supabase as any)
        .from('production_orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ordem de produção criada com sucesso',
      });

      fetchOrders();
      return data;
    } catch (error) {
      console.error('Erro ao criar ordem de produção:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar ordem de produção',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateOrder = async (id: string, updates: Partial<ProductionOrder>) => {
    try {
      const { error } = await supabase
        .from('production_orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ordem de produção atualizada com sucesso',
      });

      fetchOrders();
    } catch (error) {
      console.error('Erro ao atualizar ordem de produção:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar ordem de produção',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('production_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ordem de produção excluída com sucesso',
      });

      fetchOrders();
    } catch (error) {
      console.error('Erro ao excluir ordem de produção:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao excluir ordem de produção',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    createOrder,
    updateOrder,
    deleteOrder,
    refetch: fetchOrders,
  };
}