
import React, { useEffect } from 'react';
import { loadFonts } from '@/assets/fonts';

interface ExternalResourceManagerProps {
  enableAnalytics?: boolean;
  enableFonts?: boolean;
  children: React.ReactNode;
}

export function ExternalResourceManager({ 
  enableAnalytics = false, 
  enableFonts = true,
  children 
}: ExternalResourceManagerProps) {
  useEffect(() => {
    // Only load fonts if enabled and not already loaded
    if (enableFonts) {
      loadFonts();
    }

    // Skip analytics in development to avoid unnecessary requests
    if (enableAnalytics && process.env.NODE_ENV === 'production') {
      console.info('Analytics would be loaded here in production');
    }
  }, [enableAnalytics, enableFonts]);

  return <>{children}</>;
}
