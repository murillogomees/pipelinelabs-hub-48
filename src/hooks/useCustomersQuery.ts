import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentCompany } from './useCurrentCompany';

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

interface FetchCustomersOptions {
  search?: string;
  status?: boolean;
  customer_type?: 'individual' | 'company';
  page?: number;
  pageSize?: number;
}

export function useCustomersQuery(options: FetchCustomersOptions = {}) {
  const { data: currentCompany } = useCurrentCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar clientes
  const customersQuery = useQuery({
    queryKey: ['customers', currentCompany?.company_id, options],
    queryFn: async () => {
      if (!currentCompany?.company_id) {
        return [];
      }

      const { search, status, customer_type, page = 1, pageSize = 100 } = options;
      
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .eq('company_id', currentCompany.company_id);

      // Filtros
      if (search) {
        query = query.or(`name.ilike.%${search}%, document.ilike.%${search}%, email.ilike.%${search}%`);
      }
      
      if (status !== undefined) {
        query = query.eq('is_active', status);
      }

      if (customer_type) {
        query = query.eq('customer_type', customer_type);
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Ordenação
      query = query.order('name', { ascending: true });
      
      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        customers: (data || []) as Customer[],
        total: count || 0
      };
    },
    enabled: !!currentCompany?.company_id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });

  // Mutation para criar cliente
  const createCustomerMutation = useMutation({
    mutationFn: async (newCustomer: NewCustomer) => {
      if (!currentCompany?.company_id) {
        throw new Error('Empresa não identificada');
      }

      // Validação
      if (!newCustomer.name.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (newCustomer.document) {
        const cleanDoc = newCustomer.document.replace(/\D/g, '');
        if (newCustomer.customer_type === 'individual' && cleanDoc.length !== 11) {
          throw new Error('CPF deve ter 11 dígitos');
        }
        if (newCustomer.customer_type === 'company' && cleanDoc.length !== 14) {
          throw new Error('CNPJ deve ter 14 dígitos');
        }

        // Verificar duplicidade
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('document', newCustomer.document)
          .eq('company_id', currentCompany.company_id);
        
        if (existing && existing.length > 0) {
          throw new Error('Já existe um cliente com este CPF/CNPJ');
        }
      }

      if (newCustomer.email && !newCustomer.email.includes('@')) {
        throw new Error('E-mail inválido');
      }

      const customerData = {
        ...newCustomer,
        company_id: currentCompany.company_id
      };

      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Cliente criado",
        description: "Cliente criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar cliente",
        description: error.message,
      });
    }
  });

  // Mutation para atualizar cliente
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewCustomer> }) => {
      if (!currentCompany?.company_id) {
        throw new Error('Empresa não identificada');
      }

      // Validação básica
      if (updates.name !== undefined && !updates.name.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (updates.document) {
        const cleanDoc = updates.document.replace(/\D/g, '');
        if (updates.customer_type === 'individual' && cleanDoc.length !== 11) {
          throw new Error('CPF deve ter 11 dígitos');
        }
        if (updates.customer_type === 'company' && cleanDoc.length !== 14) {
          throw new Error('CNPJ deve ter 14 dígitos');
        }

        // Verificar duplicidade excluindo o próprio registro
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('document', updates.document)
          .eq('company_id', currentCompany.company_id)
          .neq('id', id);
        
        if (existing && existing.length > 0) {
          throw new Error('Já existe outro cliente com este CPF/CNPJ');
        }
      }

      if (updates.email && !updates.email.includes('@')) {
        throw new Error('E-mail inválido');
      }

      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .eq('company_id', currentCompany.company_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cliente",
        description: error.message,
      });
    }
  });

  // Mutation para alterar status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (!currentCompany?.company_id) {
        throw new Error('Empresa não identificada');
      }

      const { data, error } = await supabase
        .from('customers')
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('company_id', currentCompany.company_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: variables.isActive ? "Cliente ativado" : "Cliente desativado",
        description: `Cliente ${variables.isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao alterar status",
        description: error.message,
      });
    }
  });

  // Mutation para excluir cliente
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentCompany?.company_id) {
        throw new Error('Empresa não identificada');
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany.company_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Cliente excluído",
        description: "Cliente excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir cliente",
        description: error.message,
      });
    }
  });

  return {
    // Data
    customers: Array.isArray(customersQuery.data) ? customersQuery.data : customersQuery.data?.customers || [],
    total: Array.isArray(customersQuery.data) ? customersQuery.data.length : customersQuery.data?.total || 0,
    
    // States
    isLoading: customersQuery.isLoading,
    isError: customersQuery.isError,
    error: customersQuery.error,
    
    // Actions
    createCustomer: createCustomerMutation.mutateAsync,
    updateCustomer: (id: string, updates: Partial<NewCustomer>) => 
      updateCustomerMutation.mutateAsync({ id, updates }),
    toggleStatus: (id: string, isActive: boolean) => 
      toggleStatusMutation.mutateAsync({ id, isActive }),
    deleteCustomer: deleteCustomerMutation.mutateAsync,
    
    // Utilities
    refetch: customersQuery.refetch,
    
    // Loading states for mutations
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isDeleting: deleteCustomerMutation.isPending
  };
}