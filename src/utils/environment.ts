// Environment detection and configuration utilities
export type Environment = 'production' | 'staging' | 'preview' | 'development';

export const getEnvironment = (): Environment => {
  // Check for explicit environment variables first
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Check for staging domain
    if (hostname.includes('staging') || hostname.includes('homolog')) {
      return 'staging';
    }
    
    // Check for preview/development domains
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'development';
    }
    
    // Check for Vercel preview deployments
    if (hostname.includes('vercel.app') && !hostname.includes('pipelinelabs.vercel.app')) {
      return 'preview';
    }
    
    // Production domains
    if (hostname.includes('pipelinelabs.com.br') || hostname.includes('pipelinelabs.com') || hostname.includes('pipelinelabs.app')) {
      return 'production';
    }
  }
  
  // Fallback to development
  return 'development';
};

export const isProduction = (): boolean => getEnvironment() === 'production';
export const isStaging = (): boolean => getEnvironment() === 'staging';
export const isPreview = (): boolean => getEnvironment() === 'preview';
export const isDevelopment = (): boolean => getEnvironment() === 'development';

export const getEnvironmentConfig = () => {
  const env = getEnvironment();
  
  const configs = {
    production: {
      apiUrl: 'https://ycqinuwrlhuxotypqlfh.supabase.co',
      appUrl: 'https://pipelinelabs.com.br',
      enableAnalytics: true,
      enableDebug: false,
      enableErrorReporting: true,
      maxRetries: 3,
      cacheTTL: 300000, // 5 minutes
    },
    staging: {
      apiUrl: 'https://pipeline-staging.supabase.co', // Configurar projeto separado
      appUrl: 'https://staging.pipelinelabs.com.br',
      enableAnalytics: false,
      enableDebug: true,
      enableErrorReporting: true,
      maxRetries: 2,
      cacheTTL: 60000, // 1 minute
    },
    preview: {
      apiUrl: 'https://ycqinuwrlhuxotypqlfh.supabase.co', // Mesmo que prod para previews
      appUrl: window?.location?.origin || 'https://preview.vercel.app',
      enableAnalytics: false,
      enableDebug: true,
      enableErrorReporting: false,
      maxRetries: 1,
      cacheTTL: 30000, // 30 seconds
    },
    development: {
      apiUrl: 'https://ycqinuwrlhuxotypqlfh.supabase.co',
      appUrl: 'http://localhost:5173',
      enableAnalytics: false,
      enableDebug: true,
      enableErrorReporting: false,
      maxRetries: 1,
      cacheTTL: 0, // No cache
    }
  };
  
  return configs[env];
};

export const getEnvironmentBadge = () => {
  const env = getEnvironment();
  
  const badges = {
    production: { label: 'PROD', variant: 'default' as const, color: 'bg-green-500' },
    staging: { label: 'STAGING', variant: 'secondary' as const, color: 'bg-yellow-500' },
    preview: { label: 'PREVIEW', variant: 'outline' as const, color: 'bg-blue-500' },
    development: { label: 'DEV', variant: 'destructive' as const, color: 'bg-red-500' }
  };
  
  return badges[env];
};

// Staging access control
export const isStagingAccessAllowed = (userEmail?: string): boolean => {
  if (!isStaging()) return true; // Not staging, allow access
  
  const allowedEmails = [
    'murilloggomes@gmail.com',
    'admin@pipelinelabs.com',
    // Add more authorized staging users here
  ];
  
  const allowedDomains = [
    '@pipelinelabs.com.br',
    '@pipelinelabs.com',
    '@pipeline.dev'
  ];
  
  if (!userEmail) return false;
  
  // Check exact email match
  if (allowedEmails.includes(userEmail)) return true;
  
  // Check domain match
  return allowedDomains.some(domain => userEmail.endsWith(domain));
};