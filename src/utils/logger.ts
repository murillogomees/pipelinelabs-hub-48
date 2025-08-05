
export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

export interface Logger {
  debug: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, error?: any) => void;
}

const logLevel: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

export function createLogger(namespace: string): Logger {
  const log = (level: string, message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${namespace}] ${message}`;
    
    if (meta) {
      console[level as keyof Console](logMessage, meta);
    } else {
      console[level as keyof Console](logMessage);
    }
  };

  return {
    debug: (message: string, meta?: any) => log('debug', message, meta),
    info: (message: string, meta?: any) => log('info', message, meta),
    warn: (message: string, meta?: any) => log('warn', message, meta),
    error: (message: string, error?: any) => log('error', message, error),
  };
}
