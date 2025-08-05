
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
  Users, 
  Building, 
  AlertTriangle, 
  TrendingUp, 
  Database,
  Shield,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';

export default function AdminMonitoramento() {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [selectedCompany, setSelectedCompany] = useState('all');

  // Mock data queries for now
  const { data: systemStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['system-stats', selectedPeriod],
    queryFn: async () => {
      // Mock implementation
      return {
        activeUsers: 150,
        activeCompanies: 45,
        totalTransactions: 2340,
        systemUptime: 99.9,
        averageResponseTime: 120,
        errorRate: 0.01
      };
    }
  });

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies-monitor'],
    queryFn: async () => {
      // Mock implementation
      return [];
    }
  });

  const { data: recentAlerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['recent-alerts'],
    queryFn: async () => {
      // Mock implementation
      return [];
    }
  });

  const { data: performanceMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['performance-metrics', selectedPeriod],
    queryFn: async () => {
      // Mock implementation
      return {
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 78,
        networkTraffic: 1.2,
        databaseConnections: 25,
        cacheHitRate: 95
      };
    }
  });

  const StatCard = ({ title, value, icon: Icon, change, color = 'default' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+{change}%</span>
              </div>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color === 'success' ? 'text-green-500' : 'text-muted-foreground'}`} />
        </div>
      </CardContent>
    </Card>
  );

  const AlertCard = ({ alert }: any) => (
    <Card className="border-l-4 border-l-red-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{alert.title}</p>
            <p className="text-sm text-muted-foreground">{alert.description}</p>
          </div>
          <Badge variant="destructive">{alert.severity}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminPageLayout
      title="Monitoramento do Sistema"
      description="Acompanhe a performance e saúde do sistema em tempo real"
    >
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Monitoramento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="period">Período:</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger id="period" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hora</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="7d">7 dias</SelectItem>
                    <SelectItem value="30d">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="company">Empresa:</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger id="company" className="w-48">
                    <SelectValue placeholder="Todas as empresas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {companies?.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.legal_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Usuários Ativos"
                value={systemStats?.activeUsers || 0}
                icon={Users}
                change={12}
              />
              <StatCard
                title="Empresas Ativas"
                value={systemStats?.activeCompanies || 0}
                icon={Building}
                change={8}
              />
              <StatCard
                title="Transações"
                value={systemStats?.totalTransactions || 0}
                icon={Activity}
                change={25}
              />
              <StatCard
                title="Uptime"
                value={`${systemStats?.systemUptime || 0}%`}
                icon={CheckCircle}
                color="success"
              />
              <StatCard
                title="Tempo de Resposta"
                value={`${systemStats?.averageResponseTime || 0}ms`}
                icon={Clock}
              />
              <StatCard
                title="Taxa de Erro"
                value={`${systemStats?.errorRate || 0}%`}
                icon={AlertTriangle}
              />
            </div>

            {/* Status das Empresas */}
            <Card>
              <CardHeader>
                <CardTitle>Status das Empresas</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCompanies ? (
                  <div className="text-center py-8">Carregando empresas...</div>
                ) : companies?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma empresa encontrada
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companies?.map((company: any) => (
                      <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{company.legal_name}</h4>
                          <p className="text-sm text-muted-foreground">{company.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            Ativa
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {company.document}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Métricas de Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceMetrics?.cpuUsage || 0}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${performanceMetrics?.cpuUsage || 0}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memória</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceMetrics?.memoryUsage || 0}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${performanceMetrics?.memoryUsage || 0}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disco</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceMetrics?.diskUsage || 0}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${performanceMetrics?.diskUsage || 0}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Tráfego de Rede"
                value={`${performanceMetrics?.networkTraffic || 0} GB/s`}
                icon={Zap}
              />
              <StatCard
                title="Conexões DB"
                value={performanceMetrics?.databaseConnections || 0}
                icon={Database}
              />
              <StatCard
                title="Cache Hit Rate"
                value={`${performanceMetrics?.cacheHitRate || 0}%`}
                icon={Shield}
                color="success"
              />
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eventos de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento de segurança recente
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAlerts ? (
                  <div className="text-center py-8">Carregando alertas...</div>
                ) : recentAlerts?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum alerta recente
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAlerts?.map((alert: any) => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
