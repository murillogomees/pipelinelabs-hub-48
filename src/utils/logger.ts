/**
 * Logger personalizado para o Pipeline Labs
 * Remove console.logs em produção e centraliza logging
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  context?: string;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';
  private context: string = 'App';

  setContext(context: string) {
    this.context = context;
    return this;
  }

  private log(level: LogLevel, message: string, data?: any, context?: string) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      context: context || this.context
    };

    // Em produção, apenas errors críticos
    if (!this.isDevelopment) {
      if (level === 'error') {
        this.sendToErrorTracking(entry);
      }
      return;
    }

    // Em desenvolvimento, log completo
    const prefix = `[${entry.level.toUpperCase()}] ${entry.context}:`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'debug':
        console.debug(prefix, message, data);
        break;
    }
  }

  private sendToErrorTracking(entry: LogEntry) {
    // TODO: Integrar com Sentry ou similar em produção
    // Por enquanto, apenas armazena localmente para debugging
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

  // Métodos específicos para tipos comuns
  authError(message: string, error: any) {
    this.error(`Auth Error: ${message}`, error, 'Auth');
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