import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';
import { useCache } from './useCache';

interface CustomerData {
  id?: string;
  name: string;
  email?: string;
  document?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  customer_type: 'individual' | 'company';
  is_active?: boolean;
}

interface CustomerValidation {
  isValid: boolean;
  documentType?: string;
  isDuplicate: boolean;
  existingCustomer?: any;
}

interface CustomerAnalytics {
  totalSales: number;
  totalSpent: number;
  averageTicket: number;
  recentSales: any[];
}

interface SearchFilters {
  query?: string;
  customer_type?: string;
  is_active?: boolean;
  city?: string;
  state?: string;
}

export function useCustomerManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cache para lista de clientes com filtros
  const cacheKey = `customers-${currentCompany?.id}-${JSON.stringify(filters)}-${page}`;
  const { 
    data: customersData, 
    invalidateCache: invalidateCustomersCache,
    updateCache: updateCustomersCache,
    isLoading: isCacheLoading
  } = useCache({
    key: cacheKey,
    fetcher: async () => {
      if (!currentCompany?.id) return { customers: [], count: 0 };

      const { data, error } = await supabase.functions.invoke('customer-validation', {
        body: {
          action: 'smart_customer_search',
          customerData: {
            query: filters.query,
            limit: pageSize
          },
          companyId: currentCompany.id
        }
      });

      if (error) throw error;
      
      // Também buscar contagem total se necessário
      let totalCount = data.customers.length;
      if (data.customers.length === pageSize) {
        const { count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', currentCompany.id);
        totalCount = count || 0;
      }

      return {
        customers: data.customers || [],
        count: totalCount
      };
    },
    ttl: 300000, // 5 minutos
    enabled: !!currentCompany?.id
  });

  const customers = customersData?.customers || [];
  const totalCustomers = customersData?.count || 0;

  const validateDocument = useCallback(async (document: string, customerId?: string): Promise<CustomerValidation> => {
    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-validation', {
        body: {
          action: 'validate_document',
          customerData: { document },
          companyId: currentCompany?.id,
          customerId
        }
      });

      if (error) throw error;
      return data as CustomerValidation;
    } catch (error) {
      console.error('Error validating document:', error);
      toast({
        title: 'Erro na validação',
        description: 'Erro ao validar documento',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [currentCompany?.id, toast]);

  const validateEmail = useCallback(async (email: string, customerId?: string): Promise<CustomerValidation> => {
    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-validation', {
        body: {
          action: 'validate_email',
          customerData: { email },
          companyId: currentCompany?.id,
          customerId
        }
      });

      if (error) throw error;
      return data as CustomerValidation;
    } catch (error) {
      console.error('Error validating email:', error);
      toast({
        title: 'Erro na validação',
        description: 'Erro ao validar email',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [currentCompany?.id, toast]);

  const fetchAddressByCEP = useCallback(async (zipcode: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-validation', {
        body: {
          action: 'fetch_address_by_cep',
          customerData: { zipcode }
        }
      });

      if (error) throw error;
      return data.addressData;
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  }, []);

  const createCustomer = useCallback(async (customerData: CustomerData): Promise<any> => {
    setIsLoading(true);
    
    try {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }

      // Validações
      if (customerData.document) {
        const docValidation = await validateDocument(customerData.document);
        if (!docValidation.isValid) {
          throw new Error('Documento inválido');
        }
        if (docValidation.isDuplicate) {
          throw new Error('Documento já cadastrado');
        }
      }

      if (customerData.email) {
        const emailValidation = await validateEmail(customerData.email);
        if (!emailValidation.isValid) {
          throw new Error('Email inválido');
        }
        if (emailValidation.isDuplicate) {
          throw new Error('Email já cadastrado');
        }
      }

      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          company_id: currentCompany.id
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidar caches relacionados
      await Promise.all([
        invalidateCustomersCache(),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      ]);

      toast({
        title: 'Sucesso',
        description: 'Cliente criado com sucesso'
      });

      return data;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar cliente',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, validateDocument, validateEmail, invalidateCustomersCache, queryClient, toast]);

  const updateCustomer = useCallback(async (customerId: string, customerData: Partial<CustomerData>): Promise<any> => {
    setIsLoading(true);
    
    try {
      // Validações se estiver alterando documento ou email
      if (customerData.document) {
        const docValidation = await validateDocument(customerData.document, customerId);
        if (!docValidation.isValid) {
          throw new Error('Documento inválido');
        }
        if (docValidation.isDuplicate) {
          throw new Error('Documento já cadastrado');
        }
      }

      if (customerData.email) {
        const emailValidation = await validateEmail(customerData.email, customerId);
        if (!emailValidation.isValid) {
          throw new Error('Email inválido');
        }
        if (emailValidation.isDuplicate) {
          throw new Error('Email já cadastrado');
        }
      }

      const { data, error } = await supabase
        .from('customers')
        .update({
          ...customerData,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar cache local
      if (customersData?.customers) {
        const updatedList = customersData.customers.map(c => 
          c.id === customerId ? data : c
        );
        updateCustomersCache({ ...customersData, customers: updatedList });
      }

      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso'
      });

      return data;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar cliente',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, validateDocument, validateEmail, customersData, updateCustomersCache, toast]);

  const deleteCustomer = useCallback(async (customerId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Soft delete - marcar como inativo
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', customerId)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;

      // Atualizar cache local
      if (customersData?.customers) {
        const updatedList = customersData.customers.filter(c => c.id !== customerId);
        updateCustomersCache({ ...customersData, customers: updatedList, count: customersData.count - 1 });
      }

      toast({
        title: 'Sucesso',
        description: 'Cliente desativado com sucesso'
      });
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao desativar cliente',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, customersData, updateCustomersCache, toast]);

  const getCustomerAnalytics = useCallback(async (customerId: string): Promise<CustomerAnalytics | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-validation', {
        body: {
          action: 'customer_analytics',
          customerId,
          companyId: currentCompany?.id
        }
      });

      if (error) throw error;
      return data.analytics;
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      return null;
    }
  }, [currentCompany?.id]);

  const deduplicateCustomers = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-validation', {
        body: {
          action: 'deduplicate_customers',
          companyId: currentCompany?.id
        }
      });

      if (error) throw error;

      await invalidateCustomersCache();

      toast({
        title: 'Sucesso',
        description: `${data.duplicatesRemoved} duplicatas removidas`
      });

      return data;
    } catch (error: any) {
      console.error('Error deduplicating customers:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover duplicatas',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, invalidateCustomersCache, toast]);

  const searchCustomers = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset para primeira página
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const refreshCustomers = useCallback(async () => {
    await invalidateCustomersCache();
  }, [invalidateCustomersCache]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    if (!currentCompany?.id) return;

    const interval = setInterval(() => {
      refreshCustomers();
    }, 300000);

    return () => clearInterval(interval);
  }, [currentCompany?.id, refreshCustomers]);

  return {
    // Estados
    isLoading: isLoading || isCacheLoading,
    isValidating,
    customers,
    totalCustomers,
    filters,
    page,
    pageSize,

    // Funções principais
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    loadMore,

    // Validações
    validateDocument,
    validateEmail,
    fetchAddressByCEP,

    // Analytics e utilitários
    getCustomerAnalytics,
    deduplicateCustomers,
    refreshCustomers,

    // Utilitários
    getCustomerById: useCallback((id: string) => 
      customers.find(c => c.id === id), [customers]
    ),

    // Estatísticas
    hasMorePages: customers.length < totalCustomers,
    currentPage: page,
    totalPages: Math.ceil(totalCustomers / pageSize),

    // Filtros auxiliares
    activeCustomers: customers.filter(c => c.is_active !== false),
    inactiveCustomers: customers.filter(c => c.is_active === false),

    // Status
    isEmpty: customers.length === 0,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof SearchFilters])
  };
}