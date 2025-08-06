import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from './usePermissions';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  customer_type: 'individual' | 'corporate';
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  company_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UseCustomersOptions {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export const useCustomersByCompany = (options: UseCustomersOptions = {}) => {
  const { user } = useAuth();
  const { currentCompanyId, isSuperAdmin } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    searchTerm = '',
    page = 1,
    pageSize = 25,
    enabled = true
  } = options;

  // 🔍 Query otimizada para buscar clientes por company
  const customersQuery = useQuery({
    queryKey: ['customers', currentCompanyId, searchTerm, page, pageSize],
    queryFn: async () => {
      if (!user || (!currentCompanyId && !isSuperAdmin)) {
        return { data: [], count: 0 };
      }

      console.log('🔄 Fetching customers for company:', currentCompanyId);

      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' });

      // 🛡️ Aplicar filtro por company (RLS já protege, mas adicionamos filtro explícito)
      if (!isSuperAdmin && currentCompanyId) {
        query = query.eq('company_id', currentCompanyId);
      }

      // 🔍 Aplicar busca se fornecida
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,document.ilike.%${searchTerm}%`);
      }

      // 📄 Aplicar paginação
      const offset = (page - 1) * pageSize;
      query = query
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching customers:', error);
        toast({
          title: 'Erro ao carregar clientes',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      console.log('✅ Customers loaded:', data?.length || 0, 'Total:', count);
      
      return {
        data: data || [],
        count: count || 0,
        hasMore: count ? (page * pageSize) < count : false
      };
    },
    enabled: enabled && !!user && (!!currentCompanyId || isSuperAdmin),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // ➕ Mutation para criar cliente
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
      if (!currentCompanyId && !isSuperAdmin) {
        throw new Error('Company não encontrada');
      }

      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          company_id: currentCompanyId!, // RLS policy irá validar
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating customer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers', currentCompanyId] });
      toast({
        title: 'Cliente criado com sucesso!',
        description: `Cliente ${data.name} foi adicionado.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // ✏️ Mutation para atualizar cliente
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating customer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers', currentCompanyId] });
      toast({
        title: 'Cliente atualizado!',
        description: `Cliente ${data.name} foi atualizado com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 🗑️ Mutation para excluir cliente (soft delete)
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', customerId);

      if (error) {
        console.error('❌ Error deleting customer:', error);
        throw error;
      }

      return customerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', currentCompanyId] });
      toast({
        title: 'Cliente removido',
        description: 'Cliente foi removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // Dados
    customers: customersQuery.data?.data || [],
    totalCount: customersQuery.data?.count || 0,
    hasMore: customersQuery.data?.hasMore || false,
    
    // Estados
    isLoading: customersQuery.isLoading,
    isError: customersQuery.isError,
    error: customersQuery.error,
    
    // Mutations
    createCustomer: createCustomerMutation.mutate,
    updateCustomer: updateCustomerMutation.mutate,
    deleteCustomer: deleteCustomerMutation.mutate,
    
    // Estados das mutations
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isDeleting: deleteCustomerMutation.isPending,
    
    // Funções auxiliares
    refetch: customersQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['customers', currentCompanyId] })
  };
};