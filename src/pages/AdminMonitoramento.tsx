import { useState } from 'react';
import { useSystemHealth, useHealthLogs, useHealthStatus, useRunHealthCheck } from '@/hooks/useSystemHealth';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Activity, Clock, AlertTriangle, CheckCircle, XCircle, 
         Users, Building2, TrendingUp, Database, Shield, Zap, CreditCard, FileText } from 'lucide-react';
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

  // Buscar métricas da aplicação
  const { data: appMetrics } = useQuery({
    queryKey: ['app-metrics'],
    queryFn: async () => {
      const [companies, users, alerts, auditLogs] = await Promise.all([
        supabase.from('companies').select('id, created_at').limit(1000),
        supabase.from('user_companies').select('id, created_at, is_active').eq('is_active', true).limit(1000),
        supabase.from('alerts').select('id, severity, status, created_at').limit(100),
        supabase.from('audit_logs').select('id, severity, created_at').limit(100)
      ]);

      const activeCompanies = companies.data?.length || 0;
      const activeUsers = users.data?.length || 0;
      const criticalAlerts = alerts.data?.filter(a => a.severity === 'critical' && a.status === 'ativo').length || 0;
      const recentErrors = auditLogs.data?.filter(l => l.severity === 'error').length || 0;

      return { activeCompanies, activeUsers, criticalAlerts, recentErrors };
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Buscar status das integrações
  const { data: integrationStatus } = useQuery({
    queryKey: ['integration-status'],
    queryFn: async () => {
      const [stripeSettings, nfeSettings, webhookLogs] = await Promise.all([
        supabase.from('company_settings').select('stripe_secret_key, stripe_publishable_key').not('stripe_secret_key', 'is', null).limit(1),
        supabase.from('company_settings').select('nfe_api_token').not('nfe_api_token', 'is', null).limit(1),
        supabase.from('system_health_logs').select('service_name, status, created_at').order('created_at', { ascending: false }).limit(10)
      ]);

      const stripeConnected = (stripeSettings.data?.length || 0) > 0;
      const nfeConnected = (nfeSettings.data?.length || 0) > 0;
      const webhooksHealthy = webhookLogs.data?.filter(l => l.service_name.includes('webhook') && l.status === 'ok').length || 0;

      return { stripeConnected, nfeConnected, webhooksHealthy, recentWebhooks: webhookLogs.data };
    },
    refetchInterval: 60000 // Atualizar a cada 60 segundos
  });

  // Buscar logs de auditoria recentes
  const { data: auditData } = useQuery({
    queryKey: ['audit-logs-recent'],
    queryFn: async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('id, action, resource_type, severity, user_id, created_at, details')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 30000
  });

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

      {/* Métricas da Aplicação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appMetrics?.activeCompanies || 0}</div>
            <p className="text-xs text-muted-foreground">+2 desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appMetrics?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{appMetrics?.criticalAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">Necessitam atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros Recentes</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appMetrics?.recentErrors || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
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

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Stripe</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Status da Conexão:</span>
                  {integrationStatus?.stripeConnected ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Desconectado
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Pagamentos e assinaturas
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>NFE.io</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Status da API:</span>
                  {integrationStatus?.nfeConnected ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Desconectado
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Emissão de notas fiscais
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Webhooks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>Eventos Saudáveis:</span>
                  <Badge variant="outline">
                    {integrationStatus?.webhooksHealthy || 0}/10
                  </Badge>
                </div>
                <div className="mt-2">
                  <Progress value={(integrationStatus?.webhooksHealthy || 0) * 10} className="h-2" />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Últimos eventos processados
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Auditoria de Dados</span>
              </CardTitle>
              <CardDescription>
                Registro de alterações sensíveis no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditData?.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.severity === 'error' ? 'bg-red-500' : 
                        log.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <div className="font-medium">
                          {log.action} • {log.resource_type}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                      </div>
                    </div>
                    <Badge variant={
                      log.severity === 'error' ? 'destructive' : 
                      log.severity === 'warning' ? 'secondary' : 'default'
                    }>
                      {log.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Alertas do Sistema</span>
              </CardTitle>
              <CardDescription>
                Alertas críticos e avisos de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appMetrics?.criticalAlerts === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhum alerta crítico</h3>
                    <p className="text-muted-foreground">Todos os sistemas estão funcionando normalmente</p>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Existem {appMetrics?.criticalAlerts} alertas críticos que precisam de atenção imediata.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
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