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

// Fallback plans data to prevent blocking page load
function getFallbackPlans(): BillingPlan[] {
  return [
    {
      id: 'fallback-basic',
      name: 'Básico',
      description: 'Ideal para pequenos negócios iniciantes',
      price: 29.90,
      interval: 'month',
      max_users: 1,
      features: [
        'Dashboard básico',
        'Controle de vendas',
        'Gestão de clientes',
        'Relatórios simples',
        'Suporte por email'
      ],
      active: true
    },
    {
      id: 'fallback-professional',
      name: 'Profissional',
      description: 'Para negócios em crescimento',
      price: 59.90,
      interval: 'month',
      max_users: 3,
      features: [
        'Todos os recursos do Básico',
        'Gestão de estoque avançada',
        'Emissão de NFe',
        'Relatórios avançados',
        'Integração com marketplaces',
        'Suporte prioritário'
      ],
      active: true
    },
    {
      id: 'fallback-enterprise',
      name: 'Empresarial',
      description: 'Para empresas estabelecidas',
      price: 119.90,
      interval: 'month',
      max_users: 10,
      features: [
        'Todos os recursos do Profissional',
        'Múltiplos depósitos',
        'API completa',
        'White label',
        'Suporte 24/7',
        'Treinamento personalizado'
      ],
      active: true
    }
  ];
}

export function useLandingPagePlans() {
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: async (): Promise<BillingPlan[]> => {
      try {
        console.log('Fetching billing plans...');
        
        const { data, error } = await supabase
          .from('billing_plans')
          .select('*')
          .eq('active', true)
          .order('price', { ascending: true });

        if (error) {
          console.error('Error fetching billing plans:', error);
          // Return fallback data instead of throwing to prevent blocking the page
          return getFallbackPlans();
        }

        console.log('Billing plans fetched successfully:', data);

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

        return plans.length > 0 ? plans : getFallbackPlans();
      } catch (error) {
        console.error('Exception in billing plans query:', error);
        // Return fallback data instead of throwing
        return getFallbackPlans();
      }
    },
    retry: false, // Don't retry to prevent blocking
    staleTime: 30000, // 30 seconds
  });

  return {
    plans: plans || [],
    isLoading,
    error
  };
}