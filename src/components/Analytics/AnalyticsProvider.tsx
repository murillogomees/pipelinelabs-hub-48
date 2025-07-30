
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
  const location = useLocation();

  const trackEvent = async (event: { event_name: string; meta?: Record<string, any> }) => {
    try {
      const deviceType = window.innerWidth <= 768 ? 'mobile' : 'desktop';
      
      await supabase.rpc('create_analytics_event', {
        p_event_name: event.event_name,
        p_device_type: deviceType,
        p_route: location.pathname,
        p_duration_ms: null,
        p_meta: event.meta || {}
      });
    } catch (error) {
      // Silent fail for analytics to avoid spamming console
      // Only log if it's not a network/auth related error
      if (error && typeof error === 'object' && 'code' in error && error.code !== '42P01') {
        console.warn('Analytics tracking failed:', error);
      }
    }
  };

  const trackPageView = async (route?: string) => {
    await trackEvent({
      event_name: 'page_view',
      meta: {
        route: route || location.pathname,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackUserAction = async (action: string, meta?: Record<string, any>) => {
    await trackEvent({
      event_name: action,
      meta
    });
  };

  // Track page views automatically with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const trackPage = () => {
      const user = supabase.auth.getUser();
      user.then(({ data }) => {
        if (data.user) {
          trackPageView(location.pathname);
        }
      });
    };

    // Debounce page tracking to avoid excessive calls
    timeoutId = setTimeout(trackPage, 500);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

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
