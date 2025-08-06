
export const createLogger = (module: string) => {
  return {
    debug: (message: string, ...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${module}] ${message}`, ...args);
      }
    },
    info: (message: string, ...args: any[]) => {
      console.info(`[${module}] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[${module}] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(`[${module}] ${message}`, ...args);
    },
    securityEvent: (event: string, details: any) => {
      console.warn(`[SECURITY] ${event}`, details);
    }
  };
};

export const logger = createLogger('app');
