
import React, { createContext, useContext, useEffect } from 'react';
import { ExternalResourceManager } from '@/components/ui/external-resource-manager';
import { FeaturePolicyManager } from '@/components/ui/feature-policy-manager';
import { ResourceOptimizer } from '@/utils/resource-optimizer';

interface ResourceContextType {
  loadResource: (url: string, type: 'script' | 'style' | 'font') => Promise<boolean>;
  isResourceLoaded: (url: string) => boolean;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export function useResource() {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResource must be used within ResourceProvider');
  }
  return context;
}

interface ResourceProviderProps {
  children: React.ReactNode;
  enableAnalytics?: boolean;
  enableFonts?: boolean;
}

export function ResourceProvider({ 
  children, 
  enableAnalytics = false,
  enableFonts = true 
}: ResourceProviderProps) {
  useEffect(() => {
    // Cleanup unused resources on mount
    ResourceOptimizer.cleanupUnusedPreloads();
    
    // Set up periodic cleanup
    const cleanupInterval = setInterval(() => {
      ResourceOptimizer.cleanupUnusedPreloads();
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  const contextValue: ResourceContextType = {
    loadResource: ResourceOptimizer.loadResource.bind(ResourceOptimizer),
    isResourceLoaded: (url: string) => ResourceOptimizer['loadedResources'].has(url)
  };

  return (
    <ResourceContext.Provider value={contextValue}>
      <FeaturePolicyManager />
      <ExternalResourceManager 
        enableAnalytics={enableAnalytics}
        enableFonts={enableFonts}
      >
        {children}
      </ExternalResourceManager>
    </ResourceContext.Provider>
  );
}
