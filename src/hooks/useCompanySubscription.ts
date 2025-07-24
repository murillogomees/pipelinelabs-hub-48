import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CompanySubscription {
  id: string;
  company_id: string;
  billing_plan_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  billing_plan?: {
    id: string;
    name: string;
    description: string;
    price: number;
    interval: string;
    features: string[];
    max_users?: number;
  };
}

export const useCompanySubscription = (companyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ["company-subscription", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_subscriptions")
        .select(`
          *,
          billing_plan:billing_plans(
            id,
            name,
            description,
            price,
            interval,
            features
          )
        `)
        .eq("company_id", companyId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as CompanySubscription | null;
    },
    enabled: !!companyId,
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async (billingPlanId: string) => {
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          billing_plan_id: billingPlanId,
          company_id: companyId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar checkout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openPortalMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("stripe-portal", {
        body: {
          company_id: companyId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao abrir portal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isTrialActive = subscription?.trial_end 
    ? new Date(subscription.trial_end) > new Date()
    : false;

  const isSubscriptionActive = subscription?.status === "active";

  const daysUntilRenewal = subscription?.current_period_end
    ? Math.ceil((new Date(subscription.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    subscription,
    isLoading,
    error,
    createCheckout: createCheckoutMutation.mutateAsync,
    openPortal: openPortalMutation.mutateAsync,
    isCreatingCheckout: createCheckoutMutation.isPending,
    isOpeningPortal: openPortalMutation.isPending,
    isTrialActive,
    isSubscriptionActive,
    daysUntilRenewal,
  };
};