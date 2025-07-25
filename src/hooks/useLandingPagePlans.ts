import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  max_users: number;
  features: string[];
  active: boolean;
  stripe_price_id?: string;
  stripe_product_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useLandingPagePlans() {
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: async (): Promise<BillingPlan[]> => {
      const { data, error } = await supabase
        .from('billing_plans')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching billing plans:', error);
        throw error;
      }

      // Converter os dados para o formato correto
      const plans: BillingPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || 0,
        interval: plan.interval || 'month',
        max_users: plan.max_users || 0,
        features: Array.isArray(plan.features) 
          ? plan.features.filter((f): f is string => typeof f === 'string')
          : [],
        active: plan.active ?? true,
        stripe_price_id: plan.stripe_price_id || undefined,
        stripe_product_id: plan.stripe_product_id || undefined,
        created_at: plan.created_at || undefined,
        updated_at: plan.updated_at || undefined,
      }));

      return plans;
    },
  });

  return {
    plans: plans || [],
    isLoading,
    error
  };
}