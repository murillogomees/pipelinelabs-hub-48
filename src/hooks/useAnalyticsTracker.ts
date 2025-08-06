import { useAnalyticsContext } from '@/components/Analytics';
import { useCallback } from 'react';

// Hook customizado para facilitar o rastreamento em formulários e ações
export const useAnalyticsTracker = () => {
  // Analytics desabilitado - usar função vazia
  const trackUserAction = () => {};

  const trackFormSubmit = useCallback((formName: string, success: boolean = true) => {
    // Função desabilitada
  }, []);

  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    // Função desabilitada
  }, []);

  const trackFeatureUsage = useCallback((featureName: string, action: string) => {
    // Função desabilitada
  }, []);

  const trackError = useCallback((errorType: string, errorMessage?: string) => {
    // Função desabilitada
  }, []);

  return {
    trackFormSubmit,
    trackButtonClick,
    trackFeatureUsage,
    trackError
  };
};