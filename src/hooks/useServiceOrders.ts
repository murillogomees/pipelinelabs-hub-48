import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type ServiceOrder = Tables<'service_orders'>;
export type ServiceOrderWithCustomer = ServiceOrder & {
  customers?: Pick<Tables<'customers'>, 'id' | 'name' | 'document'>;
};

export interface CreateServiceOrderData {
  order_number: string;
  customer_id?: string | null;
  description: string;
  service_type?: string | null;
  priority?: string | null;
  status?: string;
  start_date?: string | null;
  completion_date?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  price?: number | null;
  cost?: number | null;
  notes?: string | null;
}

export function useServiceOrders() {
  const [orders, setOrders] = useState<ServiceOrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          customers:customer_id (id, name, document)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar ordens de serviço',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateServiceOrderData) => {
    try {
      const { data, error } = await (supabase as any)
        .from('service_orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ordem de serviço criada com sucesso',
      });

      fetchOrders();
      return data;
    } catch (error) {
      console.error('Erro ao criar ordem de serviço:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar ordem de serviço',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateOrder = async (id: string, updates: Partial<ServiceOrder>) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ordem de serviço atualizada com sucesso',
      });

      fetchOrders();
    } catch (error) {
      console.error('Erro ao atualizar ordem de serviço:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar ordem de serviço',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ordem de serviço excluída com sucesso',
      });

      fetchOrders();
    } catch (error) {
      console.error('Erro ao excluir ordem de serviço:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao excluir ordem de serviço',
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