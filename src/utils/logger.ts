
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, error?: any) => void;
  authEvent: (event: string, success: boolean, userId?: string, meta?: any) => void;
  securityEvent: (event: string, userId?: string, ipAddress?: string, meta?: any) => void;
}

export function createLogger(namespace: string): Logger {
  const log = (level: LogLevel, message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${namespace}] ${message}`;
    
    if (meta) {
      console[level](logMessage, meta);
    } else {
      console[level](logMessage);
    }
  };

  return {
    debug: (message: string, meta?: any) => log('debug', message, meta),
    info: (message: string, meta?: any) => log('info', message, meta),
    warn: (message: string, meta?: any) => log('warn', message, meta),
    error: (message: string, error?: any) => log('error', message, error),
    authEvent: (event: string, success: boolean, userId?: string, meta?: any) => {
      log('info', `Auth Event: ${event} - ${success ? 'SUCCESS' : 'FAILURE'}`, { userId, ...meta });
    },
    securityEvent: (event: string, userId?: string, ipAddress?: string, meta?: any) => {
      log('warn', `Security Event: ${event}`, { userId, ipAddress, ...meta });
    },
  };
}

// Export default logger instance
export const logger = createLogger('app');
