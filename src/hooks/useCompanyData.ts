
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/components/Auth/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';

interface CompanyData {
  id: string;
  name: string;
  legal_name?: string;
  trade_name?: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipcode?: string;
  state_registration?: string;
  municipal_registration?: string;
  tax_regime?: string;
  legal_representative?: string;
  fiscal_email?: string;
  created_at: string;
  updated_at: string;
}

interface UseCompanyDataReturn {
  company: CompanyData | null;
  isLoading: boolean;
  isUpdating: boolean;
  canEdit: boolean;
  updateCompany: (data: Partial<CompanyData>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useCompanyData(): UseCompanyDataReturn {
  const { user } = useAuth();
  const { isContratante, isSuperAdmin } = usePermissions();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Contratante e Super Admin podem editar
  const canEdit = isContratante || isSuperAdmin;

  const fetchCompany = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Buscar a primeira empresa disponível para simplificar
      const { data: companiesData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .limit(1);

      if (companyError) {
        console.error('Erro ao buscar dados da empresa:', companyError);
        toast.error('Erro ao carregar dados da empresa');
        return;
      }

      const companyData = companiesData?.[0];
      if (!companyData) {
        toast.error('Empresa não encontrada');
        return;
      }

      setCompany(companyData);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro ao carregar dados da empresa');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]); // useCallback dependency

  const updateCompany = async (updateData: Partial<CompanyData>): Promise<boolean> => {
    if (!company?.id || !canEdit) {
      toast.error('Sem permissão para atualizar dados da empresa');
      return false;
    }

    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('companies')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id);

      if (error) {
        console.error('Erro ao atualizar empresa:', error);
        toast.error('Erro ao atualizar dados da empresa');
        return false;
      }

      // Atualizar estado local
      setCompany(prev => prev ? { ...prev, ...updateData } : null);
      toast.success('Dados da empresa atualizados com sucesso');
      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar:', error);
      toast.error('Erro inesperado ao atualizar dados');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const refetch = async () => {
    await fetchCompany();
  };

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]); // Use memoized function

  return {
    company,
    isLoading,
    isUpdating,
    canEdit,
    updateCompany,
    refetch
  };
}
