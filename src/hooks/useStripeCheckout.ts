import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
        // Abrir Stripe checkout em popup para evitar bloqueio de cookies
        const popup = window.open(
          data.url, 
          'stripe-checkout',
          'width=800,height=600,scrollbars=yes,resizable=yes,status=1'
        );
        
        // Monitorar se o popup foi fechado
        const pollTimer = setInterval(() => {
          if (popup?.closed) {
            clearInterval(pollTimer);
            // Opcional: atualizar status da assinatura após fechamento
            toast({
              title: "Checkout fechado",
              description: "Verifique seu status de assinatura se o pagamento foi concluído.",
            });
          }
        }, 1000);
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