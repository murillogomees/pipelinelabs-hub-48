
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  securityEvent: (event: string, details?: any) => {
    console.warn(`[SECURITY] ${event}`, details);
  }
};

export const createLogger = (module: string) => ({
  info: (message: string, ...args: any[]) => logger.info(`[${module}] ${message}`, ...args),
  error: (message: string, ...args: any[]) => logger.error(`[${module}] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => logger.warn(`[${module}] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => logger.debug(`[${module}] ${message}`, ...args),
  securityEvent: (event: string, details?: any) => logger.securityEvent(`[${module}] ${event}`, details)
});
