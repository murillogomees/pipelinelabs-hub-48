import { useEffect } from 'react';
import { useAnalyticsContext } from '@/components/Analytics';

// Componente para rastrear eventos específicos do dashboard
export const AnalyticsTracker = () => {
  const { trackUserAction } = useAnalyticsContext();

  useEffect(() => {
    // Rastrear quando o dashboard é carregado
    trackUserAction('dashboard:loaded', {
      timestamp: new Date().toISOString(),
      session_start: true
    });

    // Rastrear tempo de permanência na página
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      trackUserAction('dashboard:session_duration', {
        duration_ms: duration,
        timestamp: new Date().toISOString()
      });
    };
  }, [trackUserAction]);

  return null;
};