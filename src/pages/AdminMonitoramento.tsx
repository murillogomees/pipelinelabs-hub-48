import { useState } from 'react';
import { useSystemHealth, useHealthLogs, useHealthStatus, useRunHealthCheck } from '@/hooks/useSystemHealth';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Activity, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ok':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'partial':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'down':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ok':
      return 'bg-green-500';
    case 'partial':
      return 'bg-yellow-500';
    case 'down':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'ok':
      return 'default';
    case 'partial':
      return 'secondary';
    case 'down':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function AdminMonitoramento() {
  const { canManageSystem, isLoading: permissionsLoading } = usePermissions();
  const { data: healthData, isLoading: healthLoading, error } = useSystemHealth();
  const { data: healthStatus } = useHealthStatus();
  const { data: healthLogs } = useHealthLogs(undefined, undefined, 50);
  const runHealthCheck = useRunHealthCheck();
  
  const [selectedService, setSelectedService] = useState<string>('');

  if (permissionsLoading) {
    return <div>Carregando...</div>;
  }

  if (!canManageSystem) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar o monitoramento do sistema.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados de monitoramento: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const handleRunHealthCheck = () => {
    runHealthCheck.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento do Sistema</h1>
          <p className="text-muted-foreground">
            Status e disponibilidade dos serviços
          </p>
        </div>
        <Button 
          onClick={handleRunHealthCheck}
          disabled={runHealthCheck.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${runHealthCheck.isPending ? 'animate-spin' : ''}`} />
          Verificar Agora
        </Button>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            {healthLoading ? (
              <Skeleton className="h-4 w-4 rounded" />
            ) : (
              getStatusIcon(healthData?.status || 'unknown')
            )}
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                <Badge variant={getStatusVariant(healthData?.status || 'unknown')}>
                  {healthData?.status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {healthData?.uptime || '0 hours'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {healthStatus ? 
                  `${healthStatus.filter((s: any) => s.current_status === 'ok').length}/${healthStatus.length}` : 
                  '0/0'
                }
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Verificação</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-sm">
                {healthData?.timestamp ? 
                  formatDistanceToNow(new Date(healthData.timestamp), { 
                    addSuffix: true, 
                    locale: ptBR 
                  }) : 
                  'Nunca'
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Serviços</CardTitle>
              <CardDescription>
                Status atual de todos os serviços monitorados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {healthData?.services && Object.entries(healthData.services).map(([serviceName, serviceData]: [string, any]) => (
                    <div key={serviceName} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(serviceData.status)}`} />
                        <div>
                          <div className="font-medium capitalize">
                            {serviceName.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Status atual do serviço
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {serviceData.response_time_ms && (
                          <span className="text-sm text-muted-foreground">
                            {serviceData.response_time_ms}ms
                          </span>
                        )}
                        <Badge variant={getStatusVariant(serviceData.status)}>
                          {serviceData.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Verificações</CardTitle>
              <CardDescription>
                Log detalhado das verificações de saúde do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthLogs?.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="font-medium capitalize">
                          {log.service_name.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                        {log.error_message && (
                          <div className="text-sm text-red-600 mt-1">
                            {log.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {log.response_time_ms && (
                        <span className="text-sm text-muted-foreground">
                          {log.response_time_ms}ms
                        </span>
                      )}
                      <Badge variant={getStatusVariant(log.status)}>
                        {log.status}
                      </Badge>
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