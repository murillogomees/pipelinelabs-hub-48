import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, TrendingDown, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSentryMetrics } from '@/hooks/useSentryMetrics';

export function ErrorMonitoringDashboard() {
  const { 
    errorStats, 
    recentErrors, 
    isLoading, 
    sentryProjectUrl 
  } = useSentryMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erros (24h)</p>
                <p className="text-2xl font-bold text-destructive">
                  {errorStats?.total24h || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Erro</p>
                <p className="text-2xl font-bold">
                  {errorStats?.errorRate || '0.0'}%
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">
                  {errorStats?.avgResponseTime || '0'}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Erros Recentes</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href={sentryProjectUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir no Sentry
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          {recentErrors && recentErrors.length > 0 ? (
            <div className="space-y-4">
              {recentErrors.map((error, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={error.level === 'error' ? 'destructive' : 'secondary'}>
                        {error.level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {error.timestamp}
                      </span>
                    </div>
                    <h4 className="font-medium mb-1">{error.title}</h4>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                    {error.url && (
                      <p className="text-xs text-muted-foreground mt-1">
                        URL: {error.url}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{error.count}x</p>
                    {error.users && (
                      <p className="text-xs text-muted-foreground">
                        {error.users} usuários
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum erro recente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" asChild>
              <a href={`${sentryProjectUrl}/issues/`} target="_blank" rel="noopener noreferrer">
                Ver Todas as Issues
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`${sentryProjectUrl}/performance/`} target="_blank" rel="noopener noreferrer">
                Monitoramento de Performance
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`${sentryProjectUrl}/releases/`} target="_blank" rel="noopener noreferrer">
                Histórico de Releases
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`${sentryProjectUrl}/settings/`} target="_blank" rel="noopener noreferrer">
                Configurações do Projeto
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}