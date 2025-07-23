import { useAnalyticsContext } from '@/components/Analytics';
import { useCallback } from 'react';

// Hook customizado para facilitar o rastreamento em formulários e ações
export const useAnalyticsTracker = () => {
  const { trackUserAction } = useAnalyticsContext();

  const trackFormSubmit = useCallback((formName: string, success: boolean = true) => {
    trackUserAction(`form:${formName}:${success ? 'submitted' : 'error'}`, {
      form_name: formName,
      success,
      timestamp: new Date().toISOString()
    });
  }, [trackUserAction]);

  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    trackUserAction('button:clicked', {
      button_name: buttonName,
      location: location || 'unknown',
      timestamp: new Date().toISOString()
    });
  }, [trackUserAction]);

  const trackFeatureUsage = useCallback((featureName: string, action: string) => {
    trackUserAction(`feature:${featureName}:${action}`, {
      feature: featureName,
      action,
      timestamp: new Date().toISOString()
    });
  }, [trackUserAction]);

  const trackError = useCallback((errorType: string, errorMessage?: string) => {
    trackUserAction('error:occurred', {
      error_type: errorType,
      error_message: errorMessage,
      timestamp: new Date().toISOString()
    });
  }, [trackUserAction]);

  return {
    trackFormSubmit,
    trackButtonClick,
    trackFeatureUsage,
    trackError
  };
};