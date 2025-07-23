
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  user_limit: number | null;
  trial_days: number;
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreatePlanData {
  name: string;
  description: string;
  price: number;
  user_limit: number | null;
  trial_days: number;
  features: string[];
  active: boolean;
}

export function usePlans() {
  const queryClient = useQueryClient();

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });
      
      if (error) throw error;
      return data as Plan[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: singlePlan } = useQuery({
    queryKey: ["plan"],
    queryFn: async () => {
      return null; // Placeholder para funcionalidade futura
    },
    enabled: false,
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: CreatePlanData) => {
      // Validação básica
      if (!planData.name.trim()) {
        throw new Error('Nome do plano é obrigatório');
      }
      if (planData.price < 0) {
        throw new Error('Preço deve ser maior ou igual a zero');
      }
      
      const { data, error } = await supabase
        .from("plans")
        .insert([{
          ...planData,
          features: planData.features || []
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano criado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao criar plano:", error);
      const message = error?.message || "Erro ao criar plano. Tente novamente.";
      toast.error(message);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...planData }: Partial<Plan> & { id: string }) => {
      // Validação básica
      if (planData.name && !planData.name.trim()) {
        throw new Error('Nome do plano é obrigatório');
      }
      if (planData.price !== undefined && planData.price < 0) {
        throw new Error('Preço deve ser maior ou igual a zero');
      }
      
      const { data, error } = await supabase
        .from("plans")
        .update({
          ...planData,
          features: planData.features || []
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano atualizado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar plano:", error);
      const message = error?.message || "Erro ao atualizar plano. Tente novamente.";
      toast.error(message);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      // Verificar se o plano existe antes de tentar excluir
      const { data: planExists, error: checkError } = await supabase
        .from("plans")
        .select("id")
        .eq("id", planId)
        .single();

      if (checkError || !planExists) {
        throw new Error('Plano não encontrado');
      }

      const { error } = await supabase
        .from("plans")
        .delete()
        .eq("id", planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano excluído com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao excluir plano:", error);
      const message = error?.message || "Erro ao excluir plano. Tente novamente.";
      toast.error(message);
    },
  });

  return {
    plans: plans || [],
    isLoading,
    error,
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
  };
}
