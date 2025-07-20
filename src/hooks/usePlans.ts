
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
  is_custom: boolean;
  is_whitelabel: boolean;
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
  is_custom: boolean;
  is_whitelabel: boolean;
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
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: CreatePlanData) => {
      const { data, error } = await supabase
        .from("plans")
        .insert([planData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar plano:", error);
      toast.error("Erro ao criar plano. Tente novamente.");
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...planData }: Partial<Plan> & { id: string }) => {
      const { data, error } = await supabase
        .from("plans")
        .update(planData)
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
    onError: (error) => {
      console.error("Erro ao atualizar plano:", error);
      toast.error("Erro ao atualizar plano. Tente novamente.");
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
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
    onError: (error) => {
      console.error("Erro ao excluir plano:", error);
      toast.error("Erro ao excluir plano. Tente novamente.");
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
