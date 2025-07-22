import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StockMovement {
  id: string;
  company_id: string;
  product_id: string;
  movement_type: 'entrada' | 'saida' | 'transferencia' | 'ajuste' | 'venda' | 'compra' | 'producao';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reason?: string;
  reference_type?: string;
  reference_id?: string;
  warehouse_from?: string;
  warehouse_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovementFormData {
  product_id: string;
  movement_type: string;
  quantity: number;
  unit_cost?: number;
  reason?: string;
  reference_type?: string;
  reference_id?: string;
  warehouse_from?: string;
  warehouse_to?: string;
}

export function useStockMovements() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: movements, isLoading } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: StockMovementFormData) => {
      const { data: newMovement, error } = await supabase
        .rpc('register_stock_movement' as any, {
          p_product_id: data.product_id,
          p_movement_type: data.movement_type,
          p_quantity: data.quantity,
          p_unit_cost: data.unit_cost,
          p_reason: data.reason,
          p_reference_type: data.reference_type,
          p_reference_id: data.reference_id,
          p_warehouse_from: data.warehouse_from,
          p_warehouse_to: data.warehouse_to
        });

      if (error) throw error;
      return newMovement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Movimentação registrada",
        description: "A movimentação de estoque foi registrada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar movimentação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    movements,
    isLoading,
    createMovement: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}