
// Este hook está DEPRECIADO - usar apenas useStripeConfig para configurações globais
// e funções diretas de edge functions para operações específicas por empresa

import { useToast } from '@/hooks/use-toast';

export function useStripeIntegration() {
  const { toast } = useToast();

  // Função depreciada - migrar para useStripeConfig ou edge functions
  const deprecated = () => {
    toast({
      title: 'Hook depreciado',
      description: 'Use useStripeConfig para configurações globais ou edge functions diretas.',
      variant: 'destructive',
    });
  };

  return {
    stripeSettings: null,
    stripeMappings: [],
    isLoading: false,
    saveStripeSettings: { mutate: deprecated, isPending: false },
    syncStripeProducts: deprecated,
    savePlanMapping: { mutate: deprecated },
    deletePlanMapping: { mutate: deprecated }
  };
}
