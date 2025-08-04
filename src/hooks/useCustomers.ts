import { useState, useEffect } from 'react';
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

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: currentCompany } = useCurrentCompany();

  const fetchCustomers = async (options?: {
    search?: string;
    status?: boolean;
    page?: number;
    pageSize?: number;
  }) => {
    try {
      setLoading(true);
      
      if (!currentCompany?.company_id) {
        console.log('No current company available for fetching customers');
        setCustomers([]);
        return;
      }

      const { search, status, page = 1, pageSize = 100 } = options || {};
      
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .eq('company_id', currentCompany.company_id);

      // Usar índices otimizados para filtros
      if (search) {
        query = query.or(`name.ilike.%${search}%, document.ilike.%${search}%`);
      }
      
      if (status !== undefined) {
        query = query.eq('is_active', status);
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Ordenação
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

  const validateCustomer = (customer: NewCustomer): string | null => {
    if (!customer.name.trim()) {
      return 'Nome é obrigatório';
    }
    
    if (customer.document) {
      // Validação básica de CPF/CNPJ
      const cleanDoc = customer.document.replace(/\D/g, '');
      if (customer.customer_type === 'individual' && cleanDoc.length !== 11) {
        return 'CPF deve ter 11 dígitos';
      }
      if (customer.customer_type === 'company' && cleanDoc.length !== 14) {
        return 'CNPJ deve ter 14 dígitos';
      }
    }
    
    if (customer.email && !customer.email.includes('@')) {
      return 'E-mail inválido';
    }
    
    return null;
  };

  const checkDuplicateDocument = async (document: string, excludeId?: string): Promise<boolean> => {
    if (!document) return false;
    
    try {
      let query = supabase
        .from('customers')
        .select('id')
        .eq('document', document);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking duplicate document:', error);
      return false;
    }
  };

  const createCustomer = async (newCustomer: NewCustomer) => {
    try {
      // Validação
      const validationError = validateCustomer(newCustomer);
      if (validationError) {
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: validationError,
        });
        return;
      }

      // Verificar duplicidade por documento
      if (newCustomer.document) {
        const isDuplicate = await checkDuplicateDocument(newCustomer.document);
        if (isDuplicate) {
          toast({
            variant: "destructive",
            title: "Cliente já existe",
            description: "Já existe um cliente com este CPF/CNPJ.",
          });
          return;
        }
      }

      // Verificar se há empresa atual
      if (!currentCompany?.company_id) {
        toast({
          variant: "destructive",
          title: "Erro de empresa",
          description: "Não foi possível identificar a empresa atual.",
        });
        return;
      }

      // Criar cliente com company_id
      const customerData = {
        ...newCustomer,
        company_id: currentCompany.company_id
      };

      const { error } = await supabase
        .from('customers')
        .insert(customerData);

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
      if (!currentCompany?.company_id) {
        toast({
          variant: "destructive",
          title: "Erro de empresa",
          description: "Não foi possível identificar a empresa atual.",
        });
        return;
      }

      // Validação
      if (updates.name !== undefined) {
        const validationError = validateCustomer(updates as NewCustomer);
        if (validationError) {
          toast({
            variant: "destructive",
            title: "Dados inválidos",
            description: validationError,
          });
          return;
        }
      }

      // Verificar duplicidade por documento (excluindo o próprio registro)
      if (updates.document) {
        const isDuplicate = await checkDuplicateDocument(updates.document, id);
        if (isDuplicate) {
          toast({
            variant: "destructive",
            title: "Cliente já existe",
            description: "Já existe outro cliente com este CPF/CNPJ.",
          });
          return;
        }
      }

      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .eq('company_id', currentCompany.company_id);

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
      if (!currentCompany?.company_id) {
        toast({
          variant: "destructive",
          title: "Erro de empresa",
          description: "Não foi possível identificar a empresa atual.",
        });
        return;
      }

      const { error } = await supabase
        .from('customers')
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('company_id', currentCompany.company_id);

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
      if (!currentCompany?.company_id) {
        toast({
          variant: "destructive",
          title: "Erro de empresa",
          description: "Não foi possível identificar a empresa atual.",
        });
        return;
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany.company_id);

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
    if (currentCompany?.company_id) {
      fetchCustomers();
    }
  }, [currentCompany?.company_id]);

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    toggleCustomerStatus,
    deleteCustomer,
    refetch: fetchCustomers,
    validateCustomer,
    checkDuplicateDocument,
  };
}