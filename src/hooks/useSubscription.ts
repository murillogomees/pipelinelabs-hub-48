
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  status: string;
  subscription_number?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  start_date: string;
  end_date?: string;
  price_paid?: number;
  payment_method?: string;
  stripe_subscription_id?: string;
  plans: {
    name: string;
    price: number;
    user_limit: number;
    features: string[];
  };
}

export function useSubscription(companyId?: string) {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription", companyId],
    queryFn: async () => {
      let query = supabase
        .from("subscriptions")
        .select(`
          *,
          plans:plan_id (
            name,
            price,
            user_limit,
            features
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data as Subscription | null;
    },
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionData: {
      company_id: string;
      plan_id: string;
      price_paid?: number;
      payment_method?: string;
    }) => {
      const { data, error } = await supabase
        .from("subscriptions")
        .insert([{
          ...subscriptionData,
          status: "active",
          start_date: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Assinatura criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar assinatura:", error);
      toast.error("Erro ao criar assinatura. Tente novamente.");
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, ...subscriptionData }: Partial<Subscription> & { id: string }) => {
      const { data, error } = await supabase
        .from("subscriptions")
        .update(subscriptionData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Assinatura atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar assinatura:", error);
      toast.error("Erro ao atualizar assinatura. Tente novamente.");
    },
  });

  const isTrialActive = subscription?.status === "trial" && 
    subscription?.trial_end_date && 
    new Date(subscription.trial_end_date) > new Date();

  const isSubscribed = subscription?.status === "active" || isTrialActive;

  const trialDaysLeft = subscription?.trial_end_date
    ? Math.ceil((new Date(subscription.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const daysUntilRenewal = subscription?.end_date
    ? Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    subscription,
    isLoading,
    error,
    refetch,
    isSubscribed,
    isTrialActive,
    trialDaysLeft,
    daysUntilRenewal,
    planName: subscription?.plans?.name,
    userLimit: subscription?.plans?.user_limit,
    features: subscription?.plans?.features || [],
    createSubscription: createSubscriptionMutation.mutateAsync,
    updateSubscription: updateSubscriptionMutation.mutateAsync,
    isCreating: createSubscriptionMutation.isPending,
    isUpdating: updateSubscriptionMutation.isPending,
  };
}
