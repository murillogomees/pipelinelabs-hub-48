
export function createLogger(name: string) {
  return {
    info: (...args: any[]) => {
      console.log(`[${name}]`, ...args);
    },
    warn: (...args: any[]) => {
      console.warn(`[${name}]`, ...args);
    },
    error: (...args: any[]) => {
      console.error(`[${name}]`, ...args);
    },
    debug: (...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[${name}]`, ...args);
      }
    }
  };
}
