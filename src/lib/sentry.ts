import * as Sentry from '@sentry/react';

// Initialize Sentry configuration
export const initSentry = () => {
  const isDevelopment = import.meta.env.DEV;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  // Não inicializar Sentry se não tiver DSN válido em desenvolvimento
  if (isDevelopment && (!sentryDsn || sentryDsn.includes('your-sentry-dsn'))) {
    console.log('[Sentry] Skipping initialization in development (no valid DSN)');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: isDevelopment ? 'development' : 'production',
    debug: isDevelopment,
    
    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    
    // Sample rates
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,
    
    // Filter out noise
    beforeSend(event, hint) {
      // Don't send 404 errors
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error && 
            typeof error.message === 'string' && error.message.includes('404')) {
          return null;
        }
      }
      
      // Don't send network timeouts
      if (event.message && event.message.includes('timeout')) {
        return null;
      }
      
      // Filter sensitive data
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      
      return event;
    },
    
    // Set user context
    initialScope: {
      tags: {
        component: 'frontend',
        project: 'pipeline-labs'
      }
    }
  });
};

// Custom error capture utilities
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional_info', context);
    }
    Sentry.captureException(error);
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role
  });
};

export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info'
  });
};
