
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Users, 
  Building, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  Server,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useCompanies } from '@/hooks/useCompanies';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminMonitoramento() {
  const [refreshing, setRefreshing] = useState(false);
  const { systemHealth, isLoading: healthLoading, refetch: refetchHealth } = useSystemHealth();
  const { companies, isLoading: companiesLoading } = useCompanies();

  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      // Mock system stats for now
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalCompanies: companies?.length || 0,
        activeCompanies: companies?.filter(c => c.is_active !== false).length || 0,
        totalSales: 0,
        totalInvoices: 0,
        systemUptime: '99.9%',
        avgResponseTime: '120ms'
      };
    },
    enabled: !companiesLoading
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchHealth();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <ProtectedRoute requireSuperAdmin>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Monitoramento do Sistema</h1>
              <p className="text-muted-foreground">
                Acompanhe a saúde e performance do sistema
              </p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="companies">Empresas</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemStats?.activeUsers || 0} ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.totalCompanies || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemStats?.activeCompanies || 0} ativas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.systemUptime || '99.9%'}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimas 24h
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.avgResponseTime || '120ms'}</div>
                  <p className="text-xs text-muted-foreground">
                    Média
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Status Geral do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(systemHealth?.overall_status || 'unknown')}>
                        {systemHealth?.overall_status || 'unknown'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Última verificação: {systemHealth?.last_check ? new Date(systemHealth.last_check).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Sistema de monitoramento em desenvolvimento. Alguns dados podem ser simulados.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {systemHealth?.services && Object.keys(systemHealth.services).length > 0 ? (
                      Object.entries(systemHealth.services).map(([serviceName, service]: [string, any]) => (
                        <div key={serviceName} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(service.status)}
                            <div>
                              <div className="font-medium">{serviceName}</div>
                              <div className="text-sm text-muted-foreground">
                                Última verificação: {service.last_check ? new Date(service.last_check).toLocaleString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(service.status)}>
                              {service.status}
                            </Badge>
                            {service.response_time_ms && (
                              <span className="text-sm text-muted-foreground">
                                {service.response_time_ms}ms
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8 text-muted-foreground">
                        Nenhum serviço monitorado encontrado
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Empresas Cadastradas</CardTitle>
              </CardHeader>
              <CardContent>
                {companiesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companies && companies.length > 0 ? (
                      companies.map((company) => (
                        <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-sm text-muted-foreground">
                              CNPJ: {company.document || 'N/A'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={(company.is_active ?? true) ? 'default' : 'secondary'}>
                              {(company.is_active ?? true) ? 'Ativa' : 'Inativa'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {company.state || 'SP'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8 text-muted-foreground">
                        Nenhuma empresa cadastrada
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Banco de Dados</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Conexões ativas</span>
                        <span className="font-mono">15/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tempo de resposta médio</span>
                        <span className="font-mono">45ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Queries/seg</span>
                        <span className="font-mono">1,234</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Aplicação</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Uso de memória</span>
                        <span className="font-mono">512MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU</span>
                        <span className="font-mono">23%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime</span>
                        <span className="font-mono">5d 12h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
