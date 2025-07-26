
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, backoffMultiplier } = {
    ...defaultRetryConfig,
    ...config
  };

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain error types
      if (
        error.name === 'AbortError' ||
        error.message?.includes('User cancelled') ||
        error.status === 401 || // Unauthorized
        error.status === 403 || // Forbidden
        error.status === 404    // Not Found
      ) {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      // Add some jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      console.warn(`Retrying request after ${jitteredDelay}ms. Attempt ${attempt + 1}/${maxRetries}. Error:`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError!;
}

export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('ERR_NETWORK_IO_SUSPENDED') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Network request failed') ||
    error?.name === 'NetworkError' ||
    error?.code === 'NETWORK_ERROR'
  );
}

export function shouldRetryError(error: any): boolean {
  if (isNetworkError(error)) return true;
  
  // Retry on 5xx server errors
  if (error?.status >= 500 && error?.status < 600) return true;
  
  // Retry on 429 (Too Many Requests)
  if (error?.status === 429) return true;
  
  // Retry on specific timeout errors
  if (error?.message?.includes('timeout')) return true;
  
  return false;
}
