
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export function useFinancialTransactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentCompanyId } = usePermissions();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['financial-transactions', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];

      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          financial_categories (
            id,
            name,
            color
          ),
          bank_accounts (
            id,
            bank_name,
            account_number
          )
        `)
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompanyId
  });

  const createTransaction = useMutation({
    mutationFn: async (transactionData: any) => {
      if (!currentCompanyId) throw new Error('Company ID not found');

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([{ ...transactionData, company_id: currentCompanyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions', currentCompanyId] });
      toast({
        title: 'Sucesso',
        description: 'Transação criada com sucesso',
      });
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar transação',
        variant: 'destructive',
      });
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      if (!currentCompanyId) throw new Error('Company ID not found');

      const { data, error } = await supabase
        .from('financial_transactions')
        .update(updates)
        .eq('id', id)
        .eq('company_id', currentCompanyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions', currentCompanyId] });
      toast({
        title: 'Sucesso',
        description: 'Transação atualizada com sucesso',
      });
    },
    onError: (error) => {
      console.error('Error updating transaction:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar transação',
        variant: 'destructive',
      });
    },
  });

  return {
    transactions,
    isLoading,
    createTransaction: createTransaction.mutate,
    updateTransaction: updateTransaction.mutate,
    isCreating: createTransaction.isPending,
    isUpdating: updateTransaction.isPending,
  };
}
