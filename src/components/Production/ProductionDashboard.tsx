import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProductionHealth } from '@/hooks/useProductionHealth';
import { useProductionConfig } from '@/hooks/useProductionConfig';
import { useProductionMetrics } from '@/hooks/useProductionMetrics';
import { Activity, Database, Shield, Zap, RefreshCw } from 'lucide-react';

export function ProductionDashboard() {
  const { 
    healthStatus, 
    isLoading: healthLoading, 
    refetch: refetchHealth,
    getStatusColor,
    getStatusIcon 
  } = useProductionHealth();
  
  const { 
    config, 
    isLoading: configLoading,
    environment,
    isProductionMode 
  } = useProductionConfig();
  
  const { recentMetrics, isLoadingMetrics } = useProductionMetrics();

  if (healthLoading || configLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando status de produção...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Produção</h1>
          <p className="text-muted-foreground">
            Monitoramento e configurações do ambiente de produção
          </p>
        </div>
        <Badge variant={isProductionMode ? 'destructive' : 'secondary'}>
          {environment.toUpperCase()}
        </Badge>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Status do Sistema</span>
              <span className="text-2xl">{getStatusIcon()}</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchHealth()}
              disabled={healthLoading}
            >
              <RefreshCw className={`h-4 w-4 ${healthLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Status */}
            <div className="space-y-2">
              <h4 className="font-medium">Status Geral</h4>
              <div className={`text-2xl font-bold ${getStatusColor()}`}>
                {healthStatus?.status?.toUpperCase() || 'UNKNOWN'}
              </div>
              <p className="text-sm text-muted-foreground">
                Última verificação: {healthStatus?.timestamp ? 
                  new Date(healthStatus.timestamp).toLocaleTimeString('pt-BR') : 
                  'N/A'
                }
              </p>
            </div>

            {/* Database Status */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Banco de Dados</span>
              </h4>
              <Badge variant={healthStatus?.services.database.status === 'ok' ? 'default' : 'destructive'}>
                {healthStatus?.services.database.status || 'unknown'}
              </Badge>
              {healthStatus?.services.database.response_time_ms && (
                <p className="text-sm text-muted-foreground">
                  Resposta: {healthStatus.services.database.response_time_ms}ms
                </p>
              )}
            </div>

            {/* Metrics */}
            <div className="space-y-2">
              <h4 className="font-medium">Métricas</h4>
              <div className="space-y-1 text-sm">
                <div>
                  Tamanho DB: {healthStatus?.metrics.database_size_mb?.toFixed(1) || 0} MB
                </div>
                <div>
                  Conexões: {healthStatus?.metrics.active_connections || 0}
                </div>
                <div>
                  Uptime: {healthStatus?.metrics.uptime_hours || 0}h
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Security Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Segurança</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>CSRF</span>
                <Badge variant={config?.security?.csrf_enabled ? 'default' : 'outline'}>
                  {config?.security?.csrf_enabled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>HTTPS</span>
                <Badge variant={config?.security?.force_https ? 'default' : 'outline'}>
                  {config?.security?.force_https ? 'Forçado' : 'Opcional'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Timeout</span>
                <span className="text-sm">{config?.security?.session_timeout_hours || 8}h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Rate Limiting</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status</span>
                <Badge variant={config?.rate_limiting?.enabled ? 'default' : 'outline'}>
                  {config?.rate_limiting?.enabled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Por minuto</span>
                <span className="text-sm">{config?.rate_limiting?.max_requests_per_minute || 60}</span>
              </div>
              <div className="flex justify-between">
                <span>Por hora</span>
                <span className="text-sm">{config?.rate_limiting?.max_requests_per_hour || 1000}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Monitoramento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sentry</span>
                <Badge variant={config?.monitoring?.sentry_enabled ? 'default' : 'outline'}>
                  {config?.monitoring?.sentry_enabled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Analytics</span>
                <Badge variant={config?.monitoring?.analytics_enabled ? 'default' : 'outline'}>
                  {config?.monitoring?.analytics_enabled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Performance</span>
                <Badge variant={config?.monitoring?.performance_monitoring ? 'default' : 'outline'}>
                  {config?.monitoring?.performance_monitoring ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMetrics ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="ml-2">Carregando métricas...</span>
            </div>
          ) : recentMetrics?.length ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentMetrics.slice(0, 10).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{metric.metric_name}</span>
                  <div className="text-right">
                    <span className="text-sm">
                      {metric.metric_value} {metric.metric_unit}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {new Date(metric.created_at).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Nenhuma métrica disponível</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}