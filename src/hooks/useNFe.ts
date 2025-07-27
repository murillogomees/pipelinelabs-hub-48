
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export function useNFe() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentCompanyId } = usePermissions();

  const { data: nfeData = [], isLoading } = useQuery({
    queryKey: ['nfe', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            id,
            name,
            document,
            email
          )
        `)
        .eq('company_id', currentCompanyId)
        .eq('invoice_type', 'NFE')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompanyId
  });

  const createNFe = useMutation({
    mutationFn: async (nfeData: any) => {
      if (!currentCompanyId) throw new Error('Company ID not found');

      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          ...nfeData,
          company_id: currentCompanyId,
          invoice_type: 'NFE'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfe', currentCompanyId] });
      toast({
        title: 'Sucesso',
        description: 'NF-e criada com sucesso',
      });
    },
    onError: (error) => {
      console.error('Error creating NFe:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar NF-e',
        variant: 'destructive',
      });
    },
  });

  const updateNFe = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      if (!currentCompanyId) throw new Error('Company ID not found');

      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .eq('company_id', currentCompanyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfe', currentCompanyId] });
      toast({
        title: 'Sucesso',
        description: 'NF-e atualizada com sucesso',
      });
    },
    onError: (error) => {
      console.error('Error updating NFe:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar NF-e',
        variant: 'destructive',
      });
    },
  });

  return {
    nfeData,
    isLoading,
    createNFe: createNFe.mutate,
    updateNFe: updateNFe.mutate,
    isCreating: createNFe.isPending,
    isUpdating: updateNFe.isPending,
  };
}
