
interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

class Logger {
  private context: string;
  private isDevelopment = import.meta.env.DEV;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] [${this.context}] ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.info(`[INFO] [${this.context}] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] [${this.context}] ${message}`, data || '');
  }

  error(message: string, data?: any) {
    console.error(`[ERROR] [${this.context}] ${message}`, data || '');
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}

export const logger = new Logger('App');
