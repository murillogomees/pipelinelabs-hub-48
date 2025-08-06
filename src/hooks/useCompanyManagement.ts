import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CompanyData {
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
  fiscal_email?: string;
  legal_representative?: string;
}

export const useCompanyManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados da empresa do usuário
  const { data: companyData, isLoading, error } = useQuery({
    queryKey: ['company-data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Primeiro buscar a empresa associada ao usuário
      const { data: userCompany, error: userCompanyError } = await supabase
        .from('user_companies')
        .select(`
          company_id,
          role,
          companies!inner (
            id,
            name,
            legal_name,
            trade_name,
            document,
            email,
            phone,
            address,
            city,
            zipcode,
            state_registration,
            municipal_registration,
            tax_regime,
            fiscal_email,
            legal_representative
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (userCompanyError) {
        console.error('Erro ao buscar empresa do usuário:', userCompanyError);
        throw userCompanyError;
      }

      if (!userCompany) {
        throw new Error('Empresa não encontrada');
      }

      return {
        ...userCompany.companies,
        role: userCompany.role
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });

  // Atualizar dados da empresa
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: Partial<CompanyData>) => {
      if (!companyData?.id) {
        throw new Error('ID da empresa não encontrado');
      }

      const { error } = await supabase
        .from('companies')
        .update(data)
        .eq('id', companyData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-data'] });
      queryClient.invalidateQueries({ queryKey: ['current-company'] });
      toast({
        title: '✅ Sucesso!',
        description: 'Dados da empresa atualizados com sucesso.',
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: '❌ Erro',
        description: 'Erro ao atualizar dados da empresa. Tente novamente.',
        variant: 'destructive',
      });
    }
  });

  // Verificar se o usuário pode editar
  const canEdit = companyData?.role === 'contratante' || companyData?.role === 'super_admin';

  return {
    companyData,
    isLoading,
    error,
    updateCompany: updateCompanyMutation.mutate,
    isUpdating: updateCompanyMutation.isPending,
    canEdit
  };
};