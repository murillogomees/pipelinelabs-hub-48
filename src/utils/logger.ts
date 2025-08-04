/**
 * Enhanced secure logger for Pipeline Labs
 * Removes console.logs in production and provides security monitoring
 */

import { supabase } from '@/integrations/supabase/client';

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'security';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  context?: string;
}

interface SecurityContext {
  userId?: string;
  sessionId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';
  private context: string = 'App';

  setContext(context: string) {
    this.context = context;
    return this;
  }

  // Sanitize sensitive data from logs
  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'certificate', 'private', 'signature', 'hash', 'email', 'document'
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => 
        key.toLowerCase().includes(sensitive)
      )) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  private log(level: LogLevel, message: string, data?: any, context?: string) {
    const sanitizedData = this.sanitizeData(data);
    const entry: LogEntry = {
      level,
      message,
      data: sanitizedData,
      timestamp: new Date(),
      context: context || this.context
    };

    // Em produção, apenas errors críticos e eventos de segurança
    if (!this.isDevelopment) {
      if (level === 'error' || level === 'security') {
        this.sendToErrorTracking(entry);
      }
      return;
    }

    // Em desenvolvimento, log completo
    const prefix = `[${entry.level.toUpperCase()}] ${entry.context}:`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, sanitizedData);
        break;
      case 'warn':
        console.warn(prefix, message, sanitizedData);
        break;
      case 'info':
        console.info(prefix, message, sanitizedData);
        break;
      case 'debug':
        console.debug(prefix, message, sanitizedData);
        break;
      case 'security':
        console.warn(`🛡️ [SECURITY] ${entry.context}:`, message, sanitizedData);
        break;
    }
  }

  private async sendToErrorTracking(entry: LogEntry) {
    // Send to Supabase for security events and errors
    if (entry.level === 'security' || entry.level === 'error') {
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: entry.level === 'security' ? 'application_security_event' : 'application_error',
          p_user_id: null,
          p_event_data: {
            message: entry.message,
            level: entry.level,
            context: entry.context,
            data: entry.data,
            timestamp: entry.timestamp.toISOString(),
            userAgent: navigator.userAgent
          },
          p_risk_level: entry.level === 'security' ? 'medium' : 'low'
        });
      } catch (error) {
        // Fail silently for logging errors to prevent recursion
      }
    }

    // Also store locally for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('pipeline_errors') || '[]');
      errors.push(entry);
      
      // Manter apenas os últimos 50 erros
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('pipeline_errors', JSON.stringify(errors));
    } catch (e) {
      // Falha silenciosa em produção
    }
  }

  error(message: string, data?: any, context?: string) {
    this.log('error', message, data, context);
  }

  warn(message: string, data?: any, context?: string) {
    this.log('warn', message, data, context);
  }

  info(message: string, data?: any, context?: string) {
    this.log('info', message, data, context);
  }

  debug(message: string, data?: any, context?: string) {
    this.log('debug', message, data, context);
  }

  // Security-specific logging
  security(message: string, data?: any, context?: string) {
    this.log('security', message, data, context);
  }

  // Métodos específicos para tipos comuns
  authError(message: string, error: any) {
    this.error(`Auth Error: ${message}`, error, 'Auth');
  }

  // Security event logging methods
  securityEvent(event: string, userId?: string, metadata?: Record<string, any>) {
    this.security(`Security Event: ${event}`, { userId, ...metadata }, 'Security');
  }

  suspiciousActivity(activity: string, userId?: string, metadata?: Record<string, any>) {
    this.security(`Suspicious Activity: ${activity}`, { userId, ...metadata }, 'Security');
  }

  authEvent(action: string, success: boolean, userId?: string, metadata?: Record<string, any>) {
    const message = `Auth ${action}: ${success ? 'SUCCESS' : 'FAILED'}`;
    if (success) {
      this.info(message, { userId, ...metadata }, 'Auth');
    } else {
      this.security(message, { userId, ...metadata }, 'Auth');
    }
  }

  apiError(message: string, error: any, endpoint?: string) {
    this.error(`API Error: ${message}`, { error, endpoint }, 'API');
  }

  formError(message: string, formData?: any) {
    this.error(`Form Error: ${message}`, formData, 'Form');
  }

  // Wrapper para async operations
  async withLogging<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: string
  ): Promise<T> {
    try {
      this.debug(`Starting ${operationName}`, undefined, context);
      const result = await operation();
      this.debug(`Completed ${operationName}`, undefined, context);
      return result;
    } catch (error) {
      this.error(`Failed ${operationName}`, error, context);
      throw error;
    }
  }
}

// Instância singleton
export const logger = new Logger();

// Helpers para diferentes contextos
export const createLogger = (context: string) => {
  return {
    error: (message: string, data?: any) => logger.error(message, data, context),
    warn: (message: string, data?: any) => logger.warn(message, data, context),
    info: (message: string, data?: any) => logger.info(message, data, context),
    debug: (message: string, data?: any) => logger.debug(message, data, context),
    authError: (message: string, error: any) => logger.authError(message, error),
    apiError: (message: string, error: any, endpoint?: string) => logger.apiError(message, error, endpoint),
    formError: (message: string, formData?: any) => logger.formError(message, formData),
    withLogging: <T>(operation: () => Promise<T>, operationName: string) => 
      logger.withLogging(operation, operationName, context)
  };
};