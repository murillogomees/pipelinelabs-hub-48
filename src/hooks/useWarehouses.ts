import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Warehouse {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  address?: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarehouseFormData {
  name: string;
  description?: string;
  address?: string;
  is_active: boolean;
  is_default: boolean;
}

export function useWarehouses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses' as any)
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: WarehouseFormData) => {
      const { data: newWarehouse, error } = await supabase
        .from('warehouses' as any)
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return newWarehouse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast({
        title: "Depósito criado",
        description: "O depósito foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar depósito",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WarehouseFormData> }) => {
      const { data: updatedWarehouse, error } = await supabase
        .from('warehouses' as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedWarehouse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast({
        title: "Depósito atualizado",
        description: "O depósito foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar depósito",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('warehouses' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast({
        title: "Depósito excluído",
        description: "O depósito foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir depósito",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    warehouses,
    isLoading,
    createWarehouse: createMutation.mutate,
    updateWarehouse: updateMutation.mutate,
    deleteWarehouse: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}