
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';
import { useCache } from './useCache';

interface ContractData {
  id?: string;
  contract_number?: string;
  title: string;
  description?: string;
  contract_type: string;
  customer_id?: string;
  supplier_id?: string;
  contract_value?: number;
  start_date: string;
  end_date: string;
  signature_date?: string;
  status: 'draft' | 'active' | 'expired' | 'cancelled';
  document_url?: string;
  observations?: string;
  termination_clause?: string;
}

interface ContractValidation {
  isValid: boolean;
  isDuplicate: boolean;
  existingContract?: any;
}

interface ContractAnalytics {
  totalContracts: number;
  totalValue: number;
  averageValue: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  expiringContracts: any[];
}

interface SearchFilters {
  query?: string;
  customer_id?: string;
  supplier_id?: string;
  contract_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  min_value?: number;
  max_value?: number;
}

export function useContractsManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  
  const { data: currentCompanyData } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cache para lista de contratos com filtros
  const cacheKey = `contracts-${currentCompany?.id}-${JSON.stringify(filters)}-${page}`;
  const { 
    data: contractsData, 
    invalidateCache: invalidateContractsCache,
    updateCache: updateContractsCache,
    isLoading: isCacheLoading
  } = useCache({
    key: cacheKey,
    fetcher: async () => {
      if (!currentCompany?.id) return { contracts: [], count: 0 };

      let query = supabase
        .from('contracts')
        .select(`
          *,
          customer:customers(name, document),
          supplier:suppliers(name, document)
        `, { count: 'exact' })
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (filters.query) {
        query = query.or(`contract_number.ilike.%${filters.query}%,title.ilike.%${filters.query}%`);
      }

      if (filters.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }

      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      if (filters.contract_type) {
        query = query.eq('contract_type', filters.contract_type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.date_from) {
        query = query.gte('start_date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('end_date', filters.date_to);
      }

      if (filters.min_value !== undefined) {
        query = query.gte('contract_value', filters.min_value);
      }

      if (filters.max_value !== undefined) {
        query = query.lte('contract_value', filters.max_value);
      }

      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        contracts: data || [],
        count: count || 0
      };
    },
    ttl: 300000, // 5 minutos
    enabled: !!currentCompany?.id
  });

  const contracts = contractsData?.contracts || [];
  const totalContracts = contractsData?.count || 0;

  const validateContract = useCallback(async (contractData: Partial<ContractData>, contractId?: string): Promise<ContractValidation> => {
    setIsValidating(true);
    
    try {
      // Validar número único se fornecido
      if (contractData.contract_number) {
        const { data: existing } = await supabase
          .from('contracts')
          .select('id, contract_number')
          .eq('contract_number', contractData.contract_number)
          .eq('company_id', currentCompany?.id)
          .neq('id', contractId || '');

        if (existing && existing.length > 0) {
          return {
            isValid: false,
            isDuplicate: true,
            existingContract: existing[0]
          };
        }
      }

      return { isValid: true, isDuplicate: false };
    } catch (error) {
      console.error('Error validating contract:', error);
      toast({
        title: 'Erro na validação',
        description: 'Erro ao validar contrato',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [currentCompany?.id, toast]);

  const createContract = useCallback(async (contractData: ContractData): Promise<any> => {
    setIsLoading(true);
    
    try {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }

      // Gerar número do contrato se não fornecido
      if (!contractData.contract_number) {
        const { data: contractNumber } = await supabase.rpc('generate_contract_number', {
          company_uuid: currentCompany.id
        });
        contractData.contract_number = contractNumber;
      }

      // Validações
      const validation = await validateContract(contractData);
      if (!validation.isValid) {
        throw new Error('Número de contrato já existe');
      }

      const { data, error } = await supabase
        .from('contracts')
        .insert({
          ...contractData,
          company_id: currentCompany.id,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidar caches relacionados
      await Promise.all([
        invalidateContractsCache(),
        queryClient.invalidateQueries({ queryKey: ['contracts'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      ]);

      toast({
        title: 'Sucesso',
        description: 'Contrato criado com sucesso'
      });

      return data;
    } catch (error: any) {
      console.error('Error creating contract:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar contrato',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, validateContract, invalidateContractsCache, queryClient, toast]);

  const updateContract = useCallback(async (contractId: string, contractData: Partial<ContractData>): Promise<any> => {
    setIsLoading(true);
    
    try {
      // Validações se estiver alterando número
      if (contractData.contract_number) {
        const validation = await validateContract(contractData, contractId);
        if (!validation.isValid) {
          throw new Error('Número de contrato já existe');
        }
      }

      const { data, error } = await supabase
        .from('contracts')
        .update({
          ...contractData,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar cache local
      if (contractsData?.contracts) {
        const updatedList = contractsData.contracts.map(c => 
          c.id === contractId ? { ...c, ...data } : c
        );
        updateContractsCache({ ...contractsData, contracts: updatedList });
      }

      toast({
        title: 'Sucesso',
        description: 'Contrato atualizado com sucesso'
      });

      return data;
    } catch (error: any) {
      console.error('Error updating contract:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar contrato',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, validateContract, contractsData, updateContractsCache, toast]);

  const cancelContract = useCallback(async (contractId: string, reason?: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          status: 'cancelled',
          observations: reason ? `Cancelado: ${reason}` : 'Cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .eq('company_id', currentCompany?.id);

      if (error) throw error;

      // Atualizar cache local
      if (contractsData?.contracts) {
        const updatedList = contractsData.contracts.map(c => 
          c.id === contractId ? { ...c, status: 'cancelled' } : c
        );
        updateContractsCache({ ...contractsData, contracts: updatedList });
      }

      toast({
        title: 'Sucesso',
        description: 'Contrato cancelado com sucesso'
      });
    } catch (error: any) {
      console.error('Error cancelling contract:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cancelar contrato',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany?.id, contractsData, updateContractsCache, toast]);

  const getContractAnalytics = useCallback(async (): Promise<ContractAnalytics | null> => {
    try {
      if (!currentCompany?.id) return null;

      const { data: contractsData } = await supabase
        .from('contracts')
        .select('status, contract_type, contract_value, end_date, title')
        .eq('company_id', currentCompany.id);

      if (!contractsData) return null;

      const totalContracts = contractsData.length;
      const totalValue = contractsData.reduce((sum, contract) => sum + Number(contract.contract_value || 0), 0);
      const averageValue = totalContracts > 0 ? totalValue / totalContracts : 0;

      const byStatus = contractsData.reduce((acc, contract) => {
        acc[contract.status] = (acc[contract.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byType = contractsData.reduce((acc, contract) => {
        acc[contract.contract_type] = (acc[contract.contract_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Contratos expirando em 30 dias
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringContracts = contractsData.filter(contract => 
        contract.status === 'active' && 
        new Date(contract.end_date) <= thirtyDaysFromNow
      );

      return {
        totalContracts,
        totalValue,
        averageValue,
        byStatus,
        byType,
        expiringContracts
      };
    } catch (error) {
      console.error('Error fetching contract analytics:', error);
      return null;
    }
  }, [currentCompany?.id]);

  const searchContracts = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset para primeira página
  }, []);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const refreshContracts = useCallback(async () => {
    await invalidateContractsCache();
  }, [invalidateContractsCache]);

  // Auto-refresh a cada 10 minutos
  useEffect(() => {
    if (!currentCompany?.id) return;

    const interval = setInterval(() => {
      refreshContracts();
    }, 600000);

    return () => clearInterval(interval);
  }, [currentCompany?.id, refreshContracts]);

  return {
    // Estados
    isLoading: isLoading || isCacheLoading,
    isValidating,
    contracts,
    totalContracts,
    filters,
    page,
    pageSize,

    // Funções principais
    createContract,
    updateContract,
    cancelContract,
    searchContracts,
    loadMore,

    // Validações
    validateContract,

    // Analytics
    getContractAnalytics,
    refreshContracts,

    // Utilitários
    getContractById: useCallback((id: string) => 
      contracts.find(c => c.id === id), [contracts]
    ),

    // Estatísticas
    hasMorePages: contracts.length < totalContracts,
    currentPage: page,
    totalPages: Math.ceil(totalContracts / pageSize),

    // Filtros auxiliares
    activeContracts: contracts.filter(c => c.status === 'active'),
    expiredContracts: contracts.filter(c => c.status === 'expired'),
    draftContracts: contracts.filter(c => c.status === 'draft'),

    // Status
    isEmpty: contracts.length === 0,
    isFiltered: Object.keys(filters).some(key => filters[key as keyof SearchFilters])
  };
}
