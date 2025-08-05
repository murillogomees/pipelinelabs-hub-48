import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from './useCurrentCompany';
import { useToast } from './use-toast';
import { useCache } from './useCache';

interface CompanyData {
  id?: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  legal_name?: string;
  trade_name?: string;
}

interface CompanyAnalytics {
  customers: number;
  products: number;
  sales: number;
  totalRevenue: number;
  recentSales: any[];
}

interface CompanyValidation {
  isValid: boolean;
  documentType: string;
  isDuplicate: boolean;
  existingCompany?: any;
}

export function useCompanyManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { data: currentCompanyData, refetch: refetchCurrentCompany } = useCurrentCompany();
  const currentCompany = currentCompanyData?.company;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cache para empresas com TTL de 10 minutos
  const { 
    data: companies, 
    invalidateCache: invalidateCompaniesCache,
    updateCache: updateCompaniesCache 
  } = useCache({
    key: 'companies-list',
    fetcher: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    ttl: 600000, // 10 minutos
    staleTime: 300000 // 5 minutos
  });

  // Cache para analytics da empresa atual
  const { 
    data: analytics, 
    invalidateCache: invalidateAnalyticsCache 
  } = useCache({
    key: `company-analytics-${currentCompany?.id}`,
    fetcher: async () => {
      if (!currentCompany?.id) return null;
      
      const { data, error } = await supabase.functions.invoke('company-management', {
        body: {
          action: 'get_company_analytics',
          companyId: currentCompany.id
        }
      });

      if (error) throw error;
      return data.analytics as CompanyAnalytics;
    },
    ttl: 300000, // 5 minutos
    enabled: !!currentCompany?.id
  });

  const validateDocument = useCallback(async (document: string, companyId?: string): Promise<CompanyValidation> => {
    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('company-management', {
        body: {
          action: 'validate_document',
          companyData: { document },
          companyId
        }
      });

      if (error) throw error;

      return data as CompanyValidation;
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
  }, [toast]);

  const createCompany = useCallback(async (companyData: CompanyData): Promise<any> => {
    setIsLoading(true);
    
    try {
      // Validar documento primeiro
      const validation = await validateDocument(companyData.document);
      
      if (!validation.isValid) {
        throw new Error('Documento inválido');
      }

      if (validation.isDuplicate) {
        throw new Error('Documento já cadastrado');
      }

      const { data, error } = await supabase.functions.invoke('company-management', {
        body: {
          action: 'create_company',
          companyData
        }
      });

      if (error) throw error;

      // Invalidar caches relacionados
      await Promise.all([
        invalidateCompaniesCache(),
        queryClient.invalidateQueries({ queryKey: ['current-company'] }),
        queryClient.invalidateQueries({ queryKey: ['companies'] })
      ]);

      toast({
        title: 'Sucesso',
        description: 'Empresa criada com sucesso'
      });

      return data.company;
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar empresa',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [validateDocument, invalidateCompaniesCache, queryClient, toast]);

  const updateCompany = useCallback(async (companyId: string, companyData: Partial<CompanyData>): Promise<any> => {
    setIsLoading(true);
    
    try {
      // Se estiver alterando documento, validar primeiro
      if (companyData.document) {
        const validation = await validateDocument(companyData.document, companyId);
        
        if (!validation.isValid) {
          throw new Error('Documento inválido');
        }

        if (validation.isDuplicate) {
          throw new Error('Documento já cadastrado');
        }
      }

      const { data, error } = await supabase.functions.invoke('company-management', {
        body: {
          action: 'update_company',
          companyData,
          companyId
        }
      });

      if (error) throw error;

      // Atualizar caches
      const updatedCompany = data.company;
      
      if (companies) {
        const updatedList = companies.map(c => 
          c.id === companyId ? updatedCompany : c
        );
        updateCompaniesCache(updatedList);
      }

      // Invalidar outros caches relacionados
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['current-company'] }),
        invalidateAnalyticsCache()
      ]);

      // Se é a empresa atual, atualizar
      if (currentCompany?.id === companyId) {
        await refetchCurrentCompany();
      }

      toast({
        title: 'Sucesso',
        description: 'Empresa atualizada com sucesso'
      });

      return updatedCompany;
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar empresa',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [validateDocument, companies, updateCompaniesCache, queryClient, invalidateAnalyticsCache, currentCompany?.id, refetchCurrentCompany, toast]);

  const deleteCompany = useCallback(async (companyId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      // Atualizar cache removendo a empresa
      if (companies) {
        const updatedList = companies.filter(c => c.id !== companyId);
        updateCompaniesCache(updatedList);
      }

      // Invalidar caches relacionados
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['current-company'] }),
        queryClient.invalidateQueries({ queryKey: ['companies'] })
      ]);

      toast({
        title: 'Sucesso',
        description: 'Empresa excluída com sucesso'
      });
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir empresa',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [companies, updateCompaniesCache, queryClient, toast]);

  const refreshAnalytics = useCallback(async () => {
    await invalidateAnalyticsCache();
  }, [invalidateAnalyticsCache]);

  const refreshCompanies = useCallback(async () => {
    await invalidateCompaniesCache();
  }, [invalidateCompaniesCache]);

  // Auto-refresh analytics a cada 5 minutos se a empresa estiver ativa
  useEffect(() => {
    if (!currentCompany?.id) return;

    const interval = setInterval(() => {
      refreshAnalytics();
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [currentCompany?.id, refreshAnalytics]);

  return {
    // Estados
    isLoading,
    isValidating,
    companies: companies || [],
    analytics,
    currentCompany,

    // Funções principais
    createCompany,
    updateCompany,
    deleteCompany,
    validateDocument,

    // Funções de cache
    refreshAnalytics,
    refreshCompanies,

    // Utilitários
    getCompanyById: useCallback((id: string) => 
      companies?.find(c => c.id === id), [companies]
    ),
    
    isCurrentCompany: useCallback((id: string) => 
      currentCompany?.id === id, [currentCompany?.id]
    ),

    // Estatísticas rápidas
    totalCompanies: companies?.length || 0,
    hasAnalytics: !!analytics,

    // Status da rede
    isOnline: navigator.onLine
  };
}