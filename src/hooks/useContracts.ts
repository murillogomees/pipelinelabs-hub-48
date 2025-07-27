import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Contract {
  id: string;
  company_id: string;
  contract_number: string;
  title: string;
  description?: string;
  contract_type: 'cliente' | 'fornecedor';
  customer_id?: string;
  supplier_id?: string;
  start_date: string;
  end_date: string;
  renewal_date?: string;
  signature_date?: string;
  contract_value: number;
  currency: string;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
  auto_renewal: boolean;
  renewal_period: number;
  document_url?: string;
  observations?: string;
  renewal_terms?: string;
  termination_clause?: string;
  notification_days: number;
  last_notification_sent?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractFormData {
  title: string;
  description?: string;
  contract_type: string;
  customer_id?: string;
  supplier_id?: string;
  start_date: string;
  end_date: string;
  renewal_date?: string;
  signature_date?: string;
  contract_value: number;
  currency: string;
  status: string;
  auto_renewal: boolean;
  renewal_period: number;
  document_url?: string;
  observations?: string;
  renewal_terms?: string;
  termination_clause?: string;
  notification_days: number;
  company_id?: string;
}

export function useContracts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ContractFormData) => {
      // Get user's company ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userCompany } = await supabase
        .from('profile' as any)
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!userCompany || !('profile' in userCompany)) throw new Error('User not found');

      // Generate contract number
      const { data: contractNumber, error: contractNumberError } = await supabase
        .rpc('generate_contract_number' as any, { 
          company_uuid: (userCompany as any).company_id 
        });

      if (contractNumberError) throw contractNumberError;

      const { data: newContract, error } = await supabase
        .from('contracts' as any)
        .insert([{
          ...data,
          company_id: (userCompany as any).company_id,
          contract_number: contractNumber
        }])
        .select()
        .single();

      if (error) throw error;
      return newContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Contrato criado",
        description: "O contrato foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContractFormData> }) => {
      const { data: updatedContract, error } = await supabase
        .from('contracts' as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Contrato atualizado",
        description: "O contrato foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contracts' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Contrato excluído",
        description: "O contrato foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    contracts,
    isLoading,
    createContract: createMutation.mutate,
    updateContract: updateMutation.mutate,
    deleteContract: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}