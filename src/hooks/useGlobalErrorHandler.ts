
import { useState, useEffect } from 'react';

interface ErrorState {
  error: any;
  retryCount: number;
  maxRetries: number;
}

export function useGlobalErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  // Listen for global errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      
      // Check if it's a Supabase error
      if (event.error?.code === 'PGRST002' || 
          event.error?.message?.includes('schema cache')) {
        setErrorState({
          error: event.error,
          retryCount: 0,
          maxRetries: 5
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if it's a Supabase error
      if (event.reason?.code === 'PGRST002' || 
          event.reason?.message?.includes('schema cache')) {
        setErrorState({
          error: event.reason,
          retryCount: 0,
          maxRetries: 5
        });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const clearError = () => {
    setErrorState(null);
  };

  const incrementRetry = () => {
    setErrorState(prev => prev ? {
      ...prev,
      retryCount: prev.retryCount + 1
    } : null);
  };

  return {
    errorState,
    clearError,
    incrementRetry
  };
}
