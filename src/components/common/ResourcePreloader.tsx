
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
    if (!enabled) return;

    const preloadedLinks: HTMLLinkElement[] = [];

    resources.forEach(resource => {
      // Verificar se o recurso já foi preloaded
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

      // Adicionar timeout para remover preload não utilizados
      const timeout = setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }, 10000); // Remove após 10 segundos se não usado

      // Limpar timeout se o recurso for carregado
      link.onload = () => {
        clearTimeout(timeout);
      };

      link.onerror = () => {
        clearTimeout(timeout);
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      };

      document.head.appendChild(link);
      preloadedLinks.push(link);
    });

    // Cleanup ao desmontar componente
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

// Hook para gerenciar preloading de recursos críticos
export function useCriticalResourcePreloader() {
  const criticalResources: PreloadResource[] = [
    {
      href: '/assets/inter-font.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    }
  ];

  return { criticalResources };
}
