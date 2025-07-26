
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEventLoggerProps {
  children: React.ReactNode;
}

class SecurityEventLogger {
  private static instance: SecurityEventLogger;

  public static getInstance(): SecurityEventLogger {
    if (!SecurityEventLogger.instance) {
      SecurityEventLogger.instance = new SecurityEventLogger();
    }
    return SecurityEventLogger.instance;
  }

  async logEvent(
    eventType: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low',
    eventData: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      await supabase.rpc('log_security_event_enhanced', {
        p_event_type: eventType,
        p_risk_level: riskLevel,
        p_event_data: eventData,
        p_ip_address: ipAddress || null,
        p_user_agent: userAgent || navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Convenience methods for common security events
  async logAuthAttempt(email: string, success: boolean) {
    await this.logEvent(
      success ? 'auth_success' : 'auth_failure',
      success ? 'low' : 'medium',
      { email, timestamp: Date.now() }
    );
  }

  async logSensitiveOperation(operation: string, resourceType: string, resourceId?: string) {
    await this.logEvent(
      'sensitive_operation',
      'medium',
      { operation, resource_type: resourceType, resource_id: resourceId }
    );
  }

  async logDataAccess(resourceType: string, resourceId: string, action: string) {
    await this.logEvent(
      'data_access',
      'low',
      { resource_type: resourceType, resource_id: resourceId, action }
    );
  }

  async logSecurityViolation(violationType: string, details: Record<string, any>) {
    await this.logEvent(
      'security_violation',
      'high',
      { violation_type: violationType, ...details }
    );
  }

  async logAdminAction(action: string, targetResource: string, targetId?: string) {
    await this.logEvent(
      'admin_action',
      'medium',
      { action, target_resource: targetResource, target_id: targetId }
    );
  }
}

// React hook to use the security logger
export function useSecurityLogger() {
  const logger = SecurityEventLogger.getInstance();

  return {
    logAuthAttempt: logger.logAuthAttempt.bind(logger),
    logSensitiveOperation: logger.logSensitiveOperation.bind(logger),
    logDataAccess: logger.logDataAccess.bind(logger),
    logSecurityViolation: logger.logSecurityViolation.bind(logger),
    logAdminAction: logger.logAdminAction.bind(logger),
    logEvent: logger.logEvent.bind(logger)
  };
}

// Export the singleton instance for direct use
export const securityLogger = SecurityEventLogger.getInstance();

// Provider component (optional, for context if needed)
export function SecurityEventLoggerProvider({ children }: SecurityEventLoggerProps) {
  return <>{children}</>;
}
