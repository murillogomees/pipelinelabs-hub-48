
// Sentry configuration for error tracking
// This is a minimal implementation to prevent 404 errors

export const initSentry = () => {
  // Sentry initialization would go here
  // For now, this is a placeholder to prevent 404 errors
  console.log('Sentry not configured');
};

export const captureException = (error: any) => {
  // In a real implementation, this would send to Sentry
  console.error('Captured exception:', error);
};

export const captureMessage = (message: string) => {
  // In a real implementation, this would send to Sentry
  console.log('Captured message:', message);
};
