import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/components/Auth/AuthProvider';

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
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const fetchCompany = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Primeiro, obter a empresa do usuário (pegar o primeiro registro ativo)
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('user_companies')
        .select('company_id, user_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (userCompanyError) {
        console.error('Erro ao buscar empresa do usuário:', userCompanyError);
        return;
      }

      const userCompany = userCompanyData?.[0];

      if (!userCompany) {
        toast.error('Usuário não possui empresa associada');
        return;
      }

      // Verificar permissões - contratante ou super admin podem editar
      const canUserEdit = userCompany.user_type === 'contratante' || 
                         userCompany.user_type === 'super_admin';
      setCanEdit(canUserEdit);

      // Buscar dados da empresa
      const { data: companiesData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', userCompany.company_id);

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
  };

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
  }, [user?.id]);

  return {
    company,
    isLoading,
    isUpdating,
    canEdit,
    updateCompany,
    refetch
  };
}