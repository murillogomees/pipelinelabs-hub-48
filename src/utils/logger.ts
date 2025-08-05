
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
  private isDevelopment = import.meta.env.DEV;

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
  }

  error(message: string, data?: any) {
    console.error(`[ERROR] ${message}`, data || '');
  }
}

export const logger = new Logger();
