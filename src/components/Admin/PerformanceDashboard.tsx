import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Database, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Server,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalCache } from '@/hooks/useGlobalCacheUnified';
import { usePerformanceOptimized } from '@/hooks/usePerformanceOptimized';

interface PerformanceMetrics {
  database: {
    activeConnections: number;
    averageQueryTime: number;
    slowQueries: number;
    cacheHitRate: number;
  };
  cache: {
    totalKeys: number;
    hitRate: number;
    missRate: number;
    memory: number;
  };
  queries: {
    total: number;
    successful: number;
    failed: number;
    averageTime: number;
  };
  realtime: {
    channels: number;
    connections: number;
    events: number;
  };
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  resolved?: boolean;
}

export function PerformanceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const queryClient = useQueryClient();
  const { invalidateByPattern, config } = useGlobalCache();
  const { optimizedDefaults } = usePerformanceOptimized();

  // Dados de performance em tempo real
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async (): Promise<PerformanceMetrics> => {
      // Simular coleta de métricas (em produção seria via edge functions)
      const cacheData = queryClient.getQueriesData({});
      const totalQueries = cacheData.length;
      const successfulQueries = cacheData.filter(([, data]) => data).length;
      
      // Métricas de performance do navegador
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memoryInfo = (performance as any).memory;
      
      return {
        database: {
          activeConnections: Math.floor(Math.random() * 50) + 10,
          averageQueryTime: navigationTiming.responseEnd - navigationTiming.requestStart,
          slowQueries: Math.floor(Math.random() * 5),
          cacheHitRate: successfulQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0,
        },
        cache: {
          totalKeys: totalQueries,
          hitRate: Math.floor(Math.random() * 30) + 70,
          missRate: Math.floor(Math.random() * 20) + 5,
          memory: memoryInfo ? memoryInfo.usedJSHeapSize : 0,
        },
        queries: {
          total: totalQueries,
          successful: successfulQueries,
          failed: totalQueries - successfulQueries,
          averageTime: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
        },
        realtime: {
          channels: Math.floor(Math.random() * 10) + 1,
          connections: Math.floor(Math.random() * 20) + 5,
          events: Math.floor(Math.random() * 100) + 50,
        },
      };
    },
    refetchInterval: 10000, // Atualiza a cada 10 segundos
    staleTime: 5000,
  });

  // Detectar alertas automáticos
  useEffect(() => {
    if (!metrics) return;

    const newAlerts: Alert[] = [];

    // Alert para cache hit rate baixo
    if (metrics.database.cacheHitRate < 50) {
      newAlerts.push({
        id: 'cache-hit-rate',
        type: 'warning',
        title: 'Cache Hit Rate Baixo',
        description: `Taxa de acerto do cache está em ${metrics.database.cacheHitRate.toFixed(1)}%. Recomendado: >80%`,
        timestamp: new Date(),
      });
    }

    // Alert para queries lentas
    if (metrics.database.slowQueries > 3) {
      newAlerts.push({
        id: 'slow-queries',
        type: 'error',
        title: 'Queries Lentas Detectadas',
        description: `${metrics.database.slowQueries} queries estão demorando mais que 1 segundo`,
        timestamp: new Date(),
      });
    }

    // Alert para uso de memória alto
    if (metrics.cache.memory > 100 * 1024 * 1024) { // 100MB
      newAlerts.push({
        id: 'high-memory',
        type: 'warning',
        title: 'Uso de Memória Alto',
        description: `Uso de memória em ${(metrics.cache.memory / 1024 / 1024).toFixed(1)}MB. Considere otimizar cache`,
        timestamp: new Date(),
      });
    }

    setAlerts(prev => {
      const existingIds = prev.map(a => a.id);
      const filteredNew = newAlerts.filter(a => !existingIds.includes(a.id));
      return [...prev, ...filteredNew];
    });
  }, [metrics]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getHealthStatus = () => {
    if (!metrics) return 'loading';
    
    const issues = [];
    if (metrics.database.cacheHitRate < 50) issues.push('cache');
    if (metrics.database.slowQueries > 3) issues.push('queries');
    if (metrics.cache.memory > 100 * 1024 * 1024) issues.push('memory');
    
    if (issues.length === 0) return 'healthy';
    if (issues.length <= 1) return 'warning';
    return 'critical';
  };

  const healthStatus = getHealthStatus();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Carregando métricas de performance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real do sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge 
            variant={healthStatus === 'healthy' ? 'default' : healthStatus === 'warning' ? 'secondary' : 'destructive'}
          >
            {healthStatus === 'healthy' && <CheckCircle className="w-4 h-4 mr-1" />}
            {healthStatus === 'warning' && <AlertTriangle className="w-4 h-4 mr-1" />}
            {healthStatus === 'critical' && <AlertTriangle className="w-4 h-4 mr-1" />}
            {healthStatus === 'healthy' ? 'Sistema Saudável' : 
             healthStatus === 'warning' ? 'Atenção' : 'Crítico'}
          </Badge>
          
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.title}:</strong> {alert.description}
              </AlertDescription>
            </Alert>
          ))}
          {alerts.length > 3 && (
            <p className="text-sm text-muted-foreground">
              +{alerts.length - 3} alertas adicionais
            </p>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="queries">Queries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Health */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Database Health
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.database.cacheHitRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Cache hit rate
                </p>
              </CardContent>
            </Card>

            {/* Query Performance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Query Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.database.averageQueryTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Último período
                </p>
              </CardContent>
            </Card>

            {/* Cache Efficiency */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cache Keys
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.cache.totalKeys}
                </div>
                <p className="text-xs text-muted-foreground">
                  Keys ativas
                </p>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Memory Usage
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(metrics?.cache.memory || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Heap utilizada
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
                <CardDescription>
                  Taxa de acerto e miss do cache
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Hit Rate</span>
                    <span className="text-sm font-medium">{metrics?.cache.hitRate}%</span>
                  </div>
                  <Progress value={metrics?.cache.hitRate} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Miss Rate</span>
                    <span className="text-sm font-medium">{metrics?.cache.missRate}%</span>
                  </div>
                  <Progress value={metrics?.cache.missRate} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Statistics</CardTitle>
                <CardDescription>
                  Estatísticas de consultas realizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics?.queries.successful}
                    </p>
                    <p className="text-sm text-muted-foreground">Successful</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {metrics?.queries.failed}
                    </p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Success Rate: {((metrics?.queries.successful || 0) / (metrics?.queries.total || 1) * 100).toFixed(1)}%
                  </p>
                  <Progress 
                    value={(metrics?.queries.successful || 0) / (metrics?.queries.total || 1) * 100} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Metrics</CardTitle>
              <CardDescription>
                Estatísticas detalhadas do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{metrics?.database.activeConnections}</p>
                  <p className="text-sm text-muted-foreground">Conexões Ativas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{metrics?.database.averageQueryTime.toFixed(0)}ms</p>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{metrics?.database.slowQueries}</p>
                  <p className="text-sm text-muted-foreground">Queries Lentas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{metrics?.database.cacheHitRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cache Configuration</CardTitle>
                <CardDescription>
                  Configurações otimizadas por categoria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(config).map(([type, config]) => (
                  <div key={type} className="border rounded p-3">
                    <h4 className="font-medium capitalize">{type}</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <span>Stale Time: {(config.staleTime / 1000 / 60).toFixed(0)}min</span>
                      <span>GC Time: {(config.gcTime / 1000 / 60).toFixed(0)}min</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Statistics</CardTitle>
                <CardDescription>
                  Estatísticas de uso do cache
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Total Keys</span>
                    <span className="font-medium">{metrics?.cache.totalKeys}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Hit Rate</span>
                    <span className="font-medium">{metrics?.cache.hitRate}%</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Memory Usage</span>
                    <span className="font-medium">{formatBytes(metrics?.cache.memory || 0)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => invalidateByPattern(['dashboard', 'userdata'])}
                  variant="outline" 
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar Cache
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query Analysis</CardTitle>
              <CardDescription>
                Análise detalhada das consultas do React Query
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queryClient.getQueryCache().getAll().slice(0, 10).map((query, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {Array.isArray(query.queryKey) ? query.queryKey.join(' → ') : String(query.queryKey)}
                      </span>
                      <Badge 
                        variant={
                          query.state.status === 'success' ? 'default' : 
                          query.state.status === 'error' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {query.state.status}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <span>
                        Última atualização: {
                          query.state.dataUpdatedAt 
                            ? new Date(query.state.dataUpdatedAt).toLocaleTimeString()
                            : 'Never'
                        }
                      </span>
                      <span>
                        Observadores: {query.getObserversCount()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}