import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { CSRFProvider } from './CSRFProtection';

interface EnhancedSecurityContextType {
  validateFormSubmission: (formData: FormData, actionType?: string) => Promise<{ isValid: boolean; reason?: string }>;
  logSecurityEvent: (eventType: string, riskLevel?: 'low' | 'medium' | 'high' | 'critical', eventData?: Record<string, any>) => Promise<void>;
  checkRateLimit: (identifier: string, actionType: string, maxAttempts?: number, windowMinutes?: number, blockMinutes?: number) => Promise<any>;
  securityMetrics: any;
  isLoading: boolean;
}

const EnhancedSecurityContext = createContext<EnhancedSecurityContextType | null>(null);

export function EnhancedSecurityProvider({ children }: { children: React.ReactNode }) {
  const {
    securityMetrics,
    isLoading,
    checkRateLimit,
    logSecurityEvent,
    validateFormSubmission,
    detectSuspiciousActivity
  } = useEnhancedSecurity();

  // Monitor page visibility changes for security
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent('page_hidden', 'low', {
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      } else {
        logSecurityEvent('page_visible', 'low', {
          timestamp: new Date().toISOString(),
          url: window.location.href
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [logSecurityEvent]);

  // Monitor for suspicious console access
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Override console methods to detect devtools usage
    console.log = (...args: any[]) => {
      if (args.some(arg => typeof arg === 'string' && arg.includes('script'))) {
        logSecurityEvent('console_script_detected', 'medium', {
          method: 'log',
          timestamp: new Date().toISOString()
        });
      }
      return originalLog(...args);
    };

    console.warn = (...args: any[]) => {
      if (args.some(arg => typeof arg === 'string' && arg.includes('script'))) {
        logSecurityEvent('console_script_detected', 'medium', {
          method: 'warn',
          timestamp: new Date().toISOString()
        });
      }
      return originalWarn(...args);
    };

    console.error = (...args: any[]) => {
      if (args.some(arg => typeof arg === 'string' && arg.includes('script'))) {
        logSecurityEvent('console_script_detected', 'medium', {
          method: 'error',
          timestamp: new Date().toISOString()
        });
      }
      return originalError(...args);
    };

    return () => {
      // Restore original console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, [logSecurityEvent]);

  // Monitor for rapid clicking/requests
  useEffect(() => {
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout;

    const handleClick = () => {
      clickCount++;
      
      if (clickTimer) clearTimeout(clickTimer);
      
      clickTimer = setTimeout(() => {
        if (clickCount > 10) {
          detectSuspiciousActivity({
            activityType: 'rapid_clicking',
            clickCount,
            timeWindow: '5_seconds'
          });
        }
        clickCount = 0;
      }, 5000);
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (clickTimer) clearTimeout(clickTimer);
    };
  }, [detectSuspiciousActivity]);

  const contextValue: EnhancedSecurityContextType = {
    validateFormSubmission,
    logSecurityEvent,
    checkRateLimit,
    securityMetrics,
    isLoading
  };

  return (
    <CSRFProvider>
      <EnhancedSecurityContext.Provider value={contextValue}>
        {children}
      </EnhancedSecurityContext.Provider>
    </CSRFProvider>
  );
}

export function useEnhancedSecurityContext() {
  const context = useContext(EnhancedSecurityContext);
  if (!context) {
    throw new Error('useEnhancedSecurityContext must be used within an EnhancedSecurityProvider');
  }
  return context;
}

export default EnhancedSecurityProvider;