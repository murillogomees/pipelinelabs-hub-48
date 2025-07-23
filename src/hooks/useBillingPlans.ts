import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BillingPlan {
  id: string;
  name: string;
  description: string | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  price: number;
  interval: string;
  max_users: number | null;
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBillingPlans = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ["billing-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_plans")
        .select("*")
        .eq("active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      return data as BillingPlan[];
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: Omit<BillingPlan, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("billing_plans")
        .insert(planData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-plans"] });
      toast({
        title: "Plano criado",
        description: "Plano de cobrança criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar plano",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...planData }: Partial<BillingPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from("billing_plans")
        .update(planData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-plans"] });
      toast({
        title: "Plano atualizado",
        description: "Plano de cobrança atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from("billing_plans")
        .update({ active: false })
        .eq("id", planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-plans"] });
      toast({
        title: "Plano desativado",
        description: "Plano de cobrança desativado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao desativar plano",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    plans,
    isLoading,
    error,
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
  };
};