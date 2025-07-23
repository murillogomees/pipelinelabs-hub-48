import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  customer_type: 'individual' | 'company';
  is_active: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface NewCustomer {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  customer_type: 'individual' | 'company';
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async (options?: {
    search?: string;
    status?: boolean;
    page?: number;
    pageSize?: number;
  }) => {
    try {
      setLoading(true);
      const { search, status, page = 1, pageSize = 100 } = options || {};
      
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' });

      // Usar índices otimizados para filtros
      if (search) {
        // Usar índice idx_customers_name_search para busca por nome
        query = query.or(`name.ilike.%${search}%, document.ilike.%${search}%`);
      }
      
      if (status !== undefined) {
        // Usar índice idx_customers_company_active
        query = query.eq('is_active', status);
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Ordenação usando índice idx_customers_name
      query = query.order('name', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      setCustomers((data || []) as Customer[]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (newCustomer: NewCustomer) => {
    try {
      const { error } = await supabase
        .from('customers')
        .insert([{ ...newCustomer, company_id: '' }]); // company_id será preenchido automaticamente pela RLS

      if (error) throw error;

      toast({
        title: "Cliente criado",
        description: "Cliente criado com sucesso.",
      });

      fetchCustomers();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar cliente",
        description: "Não foi possível criar o cliente.",
      });
    }
  };

  const updateCustomer = async (id: string, updates: Partial<NewCustomer>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso.",
      });

      fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cliente",
        description: "Não foi possível atualizar o cliente.",
      });
    }
  };

  const toggleCustomerStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: isActive ? "Cliente ativado" : "Cliente desativado",
        description: `Cliente ${isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });

      fetchCustomers();
    } catch (error) {
      console.error('Error toggling customer status:', error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do cliente.",
      });
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Cliente excluído",
        description: "Cliente excluído com sucesso.",
      });

      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir cliente",
        description: "Não foi possível excluir o cliente.",
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    toggleCustomerStatus,
    deleteCustomer,
    refetch: fetchCustomers,
  };
}