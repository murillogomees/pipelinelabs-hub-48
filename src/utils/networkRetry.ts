
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
        // Log final failure for PGRST002 errors
        if (error?.code === 'PGRST002') {
          console.error('🚨 Infrastructure error - max retries exceeded:', {
            code: error.code,
            message: error.message,
            attempts: attempt + 1,
            maxRetries: maxRetries + 1
          });
        }
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      // Add some jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      // Special handling for PGRST002 errors
      if (error?.code === 'PGRST002') {
        console.warn(`🚨 Infrastructure error detected - retrying after ${jitteredDelay}ms. Attempt ${attempt + 1}/${maxRetries + 1}. Error:`, error.message);
      } else {
        console.warn(`Retrying request after ${jitteredDelay}ms. Attempt ${attempt + 1}/${maxRetries + 1}. Error:`, error.message);
      }
      
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

export function isInfrastructureError(error: any): boolean {
  return (
    error?.code === 'PGRST002' ||
    error?.message?.includes('schema cache') ||
    error?.message?.includes('Service Unavailable') ||
    error?.status === 503 ||
    error?.status === 502
  );
}

export function shouldRetryError(error: any): boolean {
  if (isNetworkError(error)) return true;
  if (isInfrastructureError(error)) return true;
  
  // Retry on 5xx server errors (except 503 which is handled as infrastructure)
  if (error?.status >= 500 && error?.status < 600 && error?.status !== 503) return true;
  
  // Retry on 429 (Too Many Requests)
  if (error?.status === 429) return true;
  
  // Retry on specific timeout errors
  if (error?.message?.includes('timeout')) return true;
  
  return false;
}
