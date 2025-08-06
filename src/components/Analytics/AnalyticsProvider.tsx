
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsContextValue {
  trackEvent: (event: { event_name: string; meta?: Record<string, any> }) => void;
  trackPageView: (route?: string) => void;
  trackUserAction: (action: string, meta?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  // Analytics desabilitado - funções vazias para evitar erros
  const trackEvent = async (event: { event_name: string; meta?: Record<string, any> }) => {
    // Função desabilitada
  };

  const trackPageView = async (route?: string) => {
    // Função desabilitada
  };

  const trackUserAction = async (action: string, meta?: Record<string, any>) => {
    // Função desabilitada
  };

  const contextValue: AnalyticsContextValue = {
    trackEvent,
    trackPageView,
    trackUserAction
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
};
