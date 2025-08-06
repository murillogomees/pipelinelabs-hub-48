
import React, { useEffect } from 'react';
import { loadFonts } from '@/assets/fonts';
import { loadExternalScript, externalScripts } from '@/assets/scripts';
import { loadExternalStylesheet, externalStyles } from '@/assets/styles';
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
      loadExternalStylesheet(externalStyles.fonts.googleFonts);
    }

    // Load analytics scripts if enabled and not in development
    if (enableAnalytics && process.env.NODE_ENV === 'production') {
      loadExternalScript(externalScripts.analytics.plausible, () => {
        console.info('Analytics script failed to load - continuing without analytics');
      }).catch(() => {
        // Graceful degradation - app continues to work without analytics
      });
    }

    // Cleanup unused preloaded resources
    const cleanupPreloads = () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      preloadLinks.forEach(link => {
        const href = (link as HTMLLinkElement).href;
        const as = (link as HTMLLinkElement).as;
        
        // Remove unused font preloads after 5 seconds
        if (as === 'font') {
          setTimeout(() => {
            const isUsed = document.fonts.check('16px Inter') || 
                          document.querySelector(`link[href="${href}"][rel="stylesheet"]`);
            if (!isUsed) {
              link.remove();
              console.info(`🧹 Removed unused font preload: ${href}`);
            }
          }, 5000);
        }
      });
    };

    if (document.readyState === 'complete') {
      cleanupPreloads();
    } else {
      window.addEventListener('load', cleanupPreloads);
    }

    return () => {
      window.removeEventListener('load', cleanupPreloads);
    };
  }, [enableAnalytics, enableFonts]);

  return <>{children}</>;
}
