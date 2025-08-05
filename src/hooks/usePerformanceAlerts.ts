import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PerformanceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'database' | 'cache' | 'memory' | 'network' | 'user_experience';
  title: string;
  description: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  autoResolve?: boolean;
  resolved?: boolean;
  actions?: string[];
}

interface PerformanceThresholds {
  database: {
    cacheHitRate: { warning: number; critical: number };
    averageQueryTime: { warning: number; critical: number };
    slowQueries: { warning: number; critical: number };
  };
  cache: {
    memoryUsage: { warning: number; critical: number };
    hitRate: { warning: number; critical: number };
  };
  userExperience: {
    pageLoadTime: { warning: number; critical: number };
    firstContentfulPaint: { warning: number; critical: number };
  };
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  database: {
    cacheHitRate: { warning: 70, critical: 50 },
    averageQueryTime: { warning: 1000, critical: 2000 },
    slowQueries: { warning: 3, critical: 5 },
  },
  cache: {
    memoryUsage: { warning: 100 * 1024 * 1024, critical: 200 * 1024 * 1024 }, // 100MB/200MB
    hitRate: { warning: 80, critical: 60 },
  },
  userExperience: {
    pageLoadTime: { warning: 3000, critical: 5000 },
    firstContentfulPaint: { warning: 2000, critical: 3000 },
  },
};

export function usePerformanceAlerts() {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [thresholds, setThresholds] = useState<PerformanceThresholds>(DEFAULT_THRESHOLDS);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Coleta de métricas em tempo real
  const { data: metrics } = useQuery({
    queryKey: ['performance-realtime-metrics'],
    queryFn: async () => {
      const queries = queryClient.getQueryCache().getAll();
      const successful = queries.filter(q => q.state.status === 'success').length;
      const failed = queries.filter(q => q.state.status === 'error').length;
      const total = queries.length;

      // Métricas do navegador
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;

      // Métricas de React Query
      const staleTimeValues = queries
        .map(q => q.options as any)
        .filter(options => options?.staleTime !== undefined)
        .map(options => options.staleTime);
      
      const averageStaleTime = staleTimeValues.length > 0 
        ? staleTimeValues.reduce((sum, time) => sum + time, 0) / staleTimeValues.length
        : 0;

      return {
        database: {
          cacheHitRate: total > 0 ? (successful / total) * 100 : 100,
          averageQueryTime: navigation.responseEnd - navigation.requestStart,
          slowQueries: queries.filter(q => 
            q.state.dataUpdatedAt && 
            q.state.fetchStatus === 'fetching' &&
            Date.now() - q.state.dataUpdatedAt > 1000
          ).length,
          activeQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
        },
        cache: {
          totalKeys: total,
          hitRate: successful > 0 ? (successful / (successful + failed)) * 100 : 0,
          memoryUsage: memory?.usedJSHeapSize || 0,
          averageStaleTime: averageStaleTime || 0,
        },
        userExperience: {
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          timeToInteractive: navigation.loadEventEnd - navigation.fetchStart,
        },
        network: {
          onlineStatus: navigator.onLine,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown',
          rtt: (navigator as any).connection?.rtt || 0,
        },
      };
    },
    refetchInterval: 5000, // Atualiza a cada 5 segundos
    staleTime: 2000,
  });

  // Função para verificar alertas
  const checkAlerts = useCallback((currentMetrics: any) => {
    if (!currentMetrics) return;

    const newAlerts: PerformanceAlert[] = [];

    // Verificar Database Alerts
    const dbMetrics = currentMetrics.database;
    
    if (dbMetrics.cacheHitRate < thresholds.database.cacheHitRate.critical) {
      newAlerts.push({
        id: 'db-cache-critical',
        type: 'critical',
        category: 'database',
        title: 'Cache Hit Rate Crítico',
        description: `Taxa de acerto muito baixa: ${dbMetrics.cacheHitRate.toFixed(1)}%`,
        threshold: thresholds.database.cacheHitRate.critical,
        currentValue: dbMetrics.cacheHitRate,
        timestamp: new Date(),
        actions: ['Verificar queries', 'Otimizar índices', 'Aumentar stale time'],
      });
    } else if (dbMetrics.cacheHitRate < thresholds.database.cacheHitRate.warning) {
      newAlerts.push({
        id: 'db-cache-warning',
        type: 'warning',
        category: 'database',
        title: 'Cache Hit Rate Baixo',
        description: `Taxa de acerto abaixo do recomendado: ${dbMetrics.cacheHitRate.toFixed(1)}%`,
        threshold: thresholds.database.cacheHitRate.warning,
        currentValue: dbMetrics.cacheHitRate,
        timestamp: new Date(),
        actions: ['Revisar configurações de cache'],
      });
    }

    if (dbMetrics.averageQueryTime > thresholds.database.averageQueryTime.critical) {
      newAlerts.push({
        id: 'db-slow-queries-critical',
        type: 'critical',
        category: 'database',
        title: 'Queries Muito Lentas',
        description: `Tempo médio: ${dbMetrics.averageQueryTime.toFixed(0)}ms`,
        threshold: thresholds.database.averageQueryTime.critical,
        currentValue: dbMetrics.averageQueryTime,
        timestamp: new Date(),
        actions: ['Analisar queries', 'Adicionar índices', 'Otimizar consultas'],
      });
    }

    // Verificar Cache Alerts
    const cacheMetrics = currentMetrics.cache;
    
    if (cacheMetrics.memoryUsage > thresholds.cache.memoryUsage.critical) {
      newAlerts.push({
        id: 'cache-memory-critical',
        type: 'critical',
        category: 'memory',
        title: 'Uso de Memória Crítico',
        description: `Memória em uso: ${(cacheMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`,
        threshold: thresholds.cache.memoryUsage.critical,
        currentValue: cacheMetrics.memoryUsage,
        timestamp: new Date(),
        actions: ['Limpar cache', 'Reduzir gcTime', 'Otimizar dados'],
      });
    }

    // Verificar User Experience Alerts
    const uxMetrics = currentMetrics.userExperience;
    
    if (uxMetrics.pageLoadTime > thresholds.userExperience.pageLoadTime.warning) {
      newAlerts.push({
        id: 'ux-slow-load',
        type: uxMetrics.pageLoadTime > thresholds.userExperience.pageLoadTime.critical ? 'critical' : 'warning',
        category: 'user_experience',
        title: 'Carregamento Lento',
        description: `Tempo de carregamento: ${(uxMetrics.pageLoadTime / 1000).toFixed(1)}s`,
        threshold: thresholds.userExperience.pageLoadTime.warning,
        currentValue: uxMetrics.pageLoadTime,
        timestamp: new Date(),
        actions: ['Otimizar recursos', 'Implementar lazy loading', 'Revisar bundle size'],
      });
    }

    // Atualizar alertas (evitar duplicatas)
    setAlerts(prev => {
      const existingIds = prev.map(a => a.id);
      const filtered = newAlerts.filter(a => !existingIds.includes(a.id));
      
      // Auto-resolver alertas que não são mais válidos
      const updated = prev.map(alert => {
        const stillValid = newAlerts.some(na => na.id === alert.id);
        return stillValid ? alert : { ...alert, resolved: true };
      });
      
      return [...updated, ...filtered];
    });

    // Notificações para alertas críticos
    newAlerts.filter(a => a.type === 'critical').forEach(alert => {
      toast({
        title: alert.title,
        description: alert.description,
        variant: 'destructive',
      });
    });

  }, [thresholds, toast]);

  // Executar verificação de alertas
  useEffect(() => {
    if (metrics) {
      checkAlerts(metrics);
    }
  }, [metrics, checkAlerts]);

  // Ações automáticas de otimização
  const autoOptimize = useCallback(async (alertType: string) => {
    switch (alertType) {
      case 'cache-memory-critical':
        // Limpar cache antigo
        const queryCache = queryClient.getQueryCache();
        queryCache.clear();
        
        toast({
          title: 'Otimização Automática',
          description: 'Cache limpo automaticamente devido ao alto uso de memória',
        });
        break;
        
      case 'db-cache-critical':
        // Invalidar queries antigas
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const lastUpdate = query.state.dataUpdatedAt;
            return lastUpdate && Date.now() - lastUpdate > 1000 * 60 * 30; // 30 min
          }
        });
        
        toast({
          title: 'Otimização Automática',
          description: 'Queries antigas invalidadas para melhorar cache hit rate',
        });
        break;
    }
  }, [queryClient, toast]);

  // Resolver alerta manualmente
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  }, []);

  // Atualizar thresholds
  const updateThresholds = useCallback((newThresholds: Partial<PerformanceThresholds>) => {
    setThresholds(prev => ({
      ...prev,
      ...newThresholds,
    }));
  }, []);

  // Estatísticas dos alertas
  const alertStats = {
    total: alerts.length,
    critical: alerts.filter(a => a.type === 'critical' && !a.resolved).length,
    warning: alerts.filter(a => a.type === 'warning' && !a.resolved).length,
    resolved: alerts.filter(a => a.resolved).length,
  };

  return {
    alerts: alerts.filter(a => !a.resolved),
    resolvedAlerts: alerts.filter(a => a.resolved),
    alertStats,
    metrics,
    thresholds,
    updateThresholds,
    resolveAlert,
    autoOptimize,
    checkAlerts: () => checkAlerts(metrics),
  };
}

/**
 * Hook para métricas de usuário em tempo real
 */
export function useUserMetrics() {
  const [sessionMetrics, setSessionMetrics] = useState({
    startTime: Date.now(),
    pageViews: 0,
    interactions: 0,
    errors: 0,
    performance: {
      averageResponseTime: 0,
      slowestQuery: 0,
      fastestQuery: Infinity,
    },
  });

  // Rastrear navegação
  useEffect(() => {
    const handleNavigation = () => {
      setSessionMetrics(prev => ({
        ...prev,
        pageViews: prev.pageViews + 1,
      }));
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Rastrear interações
  useEffect(() => {
    const handleInteraction = () => {
      setSessionMetrics(prev => ({
        ...prev,
        interactions: prev.interactions + 1,
      }));
    };

    const events = ['click', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  // Rastrear erros
  useEffect(() => {
    const handleError = () => {
      setSessionMetrics(prev => ({
        ...prev,
        errors: prev.errors + 1,
      }));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const getSessionDuration = () => {
    return Date.now() - sessionMetrics.startTime;
  };

  const getEngagementScore = () => {
    const duration = getSessionDuration() / 1000 / 60; // minutos
    const interactionRate = sessionMetrics.interactions / Math.max(duration, 1);
    const errorRate = sessionMetrics.errors / Math.max(sessionMetrics.pageViews, 1);
    
    return Math.max(0, Math.min(100, 
      (interactionRate * 10) + 
      (sessionMetrics.pageViews * 5) - 
      (errorRate * 20)
    ));
  };

  return {
    sessionMetrics,
    sessionDuration: getSessionDuration(),
    engagementScore: getEngagementScore(),
  };
}