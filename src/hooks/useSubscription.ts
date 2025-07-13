import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  status: string;
  trial_start_date?: string;
  trial_end_date?: string;
  start_date: string;
  end_date?: string;
  price_paid?: number;
  plans: {
    name: string;
    price: number;
    user_limit: number;
    features: string[];
    is_custom: boolean;
  };
}

export function useSubscription() {
  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          plans:plan_id (
            name,
            price,
            user_limit,
            features,
            is_custom
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as Subscription | null;
    },
  });

  const isTrialActive = subscription?.status === "trial" && 
    subscription?.trial_end_date && 
    new Date(subscription.trial_end_date) > new Date();

  const isSubscribed = subscription?.status === "active" || isTrialActive;

  const trialDaysLeft = subscription?.trial_end_date
    ? Math.ceil((new Date(subscription.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    subscription,
    isLoading,
    error,
    refetch,
    isSubscribed,
    isTrialActive,
    trialDaysLeft,
    planName: subscription?.plans?.name,
    userLimit: subscription?.plans?.user_limit,
    features: subscription?.plans?.features || [],
  };
}