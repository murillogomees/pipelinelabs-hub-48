import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { BillingPlan } from './useLandingPagePlans';

export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createCheckoutSession = async (billing_plan_id: string, company_id?: string) => {
    setIsLoading(true);
    
    try {
      // Se não tem company_id, precisamos fazer login primeiro
      if (!company_id) {
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para assinar um plano.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          billing_plan_id,
          company_id
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Abrir Stripe checkout em nova aba
        window.open(data.url, '_blank');
      }

    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: error.message || "Houve um problema ao processar sua solicitação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    isLoading
  };
}