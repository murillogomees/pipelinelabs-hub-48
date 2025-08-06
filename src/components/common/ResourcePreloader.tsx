
import { useEffect } from 'react';

interface PreloadResource {
  href: string;
  as: 'script' | 'style' | 'font' | 'image' | 'fetch';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

interface ResourcePreloaderProps {
  resources: PreloadResource[];
  enabled?: boolean;
}

export function ResourcePreloader({ resources, enabled = true }: ResourcePreloaderProps) {
  useEffect(() => {
    if (!enabled || !resources.length) return;

    const preloadedLinks: HTMLLinkElement[] = [];

    resources.forEach(resource => {
      // Skip invalid or local resources that might not exist
      if (!resource.href.startsWith('http')) {
        console.warn(`Skipping invalid resource: ${resource.href}`);
        return;
      }

      // Check if already preloaded
      const existingLink = document.querySelector(`link[href="${resource.href}"][rel="preload"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) {
        link.type = resource.type;
      }
      
      if (resource.crossOrigin) {
        link.crossOrigin = resource.crossOrigin;
      }

      link.onerror = () => {
        console.warn(`Failed to preload resource: ${resource.href}`);
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      };

      document.head.appendChild(link);
      preloadedLinks.push(link);
    });

    // Cleanup on unmount
    return () => {
      preloadedLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [resources, enabled]);

  return null;
}

// Simplified hook that returns empty array to avoid loading non-existent resources
export function useCriticalResourcePreloader() {
  // Return empty array to prevent unnecessary resource loading
  const criticalResources: PreloadResource[] = [];
  return { criticalResources };
}
