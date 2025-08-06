
import { useEffect } from 'react';

/**
 * Hook para otimizar mensagens do console e reduzir warnings desnecessários
 */
export function useConsoleOptimizer() {
  useEffect(() => {
    // Interceptar e filtrar warnings conhecidos que não são críticos
    const originalWarn = console.warn;
    const originalError = console.error;

    const ignoredWarnings = [
      'Unrecognized feature:', // Feature policies não suportadas
      'was preloaded using link preload but not used', // Preload warnings
      'vr', 'ambient-light-sensor', 'battery', // Features deprecadas
    ];

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Não mostrar warnings conhecidos em produção
      if (process.env.NODE_ENV === 'production') {
        const shouldIgnore = ignoredWarnings.some(ignored => 
          message.includes(ignored)
        );
        
        if (shouldIgnore) return;
      }
      
      originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Log errors críticos sempre
      originalError.apply(console, args);
      
      // Em desenvolvimento, adicionar contexto extra para debugging
      if (process.env.NODE_ENV === 'development' && message.includes('Unrecognized feature')) {
        console.info('💡 This warning is from browser feature detection and can be safely ignored.');
      }
    };

    // Cleanup
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);
}

/**
 * Hook para monitorar performance e identificar recursos não utilizados
 */
export function useResourceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;

    // Monitorar recursos preloaded não utilizados
    const checkUnusedPreloads = () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      
      preloadLinks.forEach(link => {
        const href = (link as HTMLLinkElement).href;
        const as = (link as HTMLLinkElement).as;
        
        // Verificar se o recurso foi realmente utilizado
        setTimeout(() => {
          if (as === 'script') {
            const script = document.querySelector(`script[src="${href}"]`);
            if (!script) {
              console.info(`🔍 Preloaded script not used: ${href}`);
            }
          }
          
          if (as === 'style') {
            const style = document.querySelector(`link[href="${href}"][rel="stylesheet"]`);
            if (!style) {
              console.info(`🔍 Preloaded stylesheet not used: ${href}`);
            }
          }
        }, 3000);
      });
    };

    // Executar verificação após o load
    if (document.readyState === 'complete') {
      checkUnusedPreloads();
    } else {
      window.addEventListener('load', checkUnusedPreloads);
    }

    return () => {
      window.removeEventListener('load', checkUnusedPreloads);
    };
  }, []);
}
