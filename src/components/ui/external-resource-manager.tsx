
import React, { useEffect } from 'react';
import { loadFonts } from '@/assets/fonts';
import { useConsoleOptimizer, useResourceMonitoring } from '@/hooks/useConsoleOptimizer';

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
  useConsoleOptimizer();
  useResourceMonitoring();

  useEffect(() => {
    // Load fonts if enabled
    if (enableFonts) {
      loadFonts();
    }

    // Load analytics scripts if enabled and not in development
    if (enableAnalytics && process.env.NODE_ENV === 'production') {
      // Analytics loading can be implemented here if needed
      console.info('Analytics disabled in development mode');
    }

    // Cleanup function
    return () => {
      // Cleanup any resources if needed
    };
  }, [enableAnalytics, enableFonts]);

  return <>{children}</>;
}
