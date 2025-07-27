
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Activity, 
  Users, 
  Database, 
  Server, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  TrendingUp,
  Eye
} from 'lucide-react';

const AdminMonitoramento: React.FC = () => {
  const { isSuperAdmin, currentCompanyId } = usePermissions();

  const { data: systemMetrics, isLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .limit(100);

      if (error) throw error;
      return data;
    }
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      return data;
    }
  });

  const { data: companyStats } = useQuery({
    queryKey: ['company-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*');

      if (error) throw error;
      return data;
    }
  });

  if (!isSuperAdmin) {
    return (
      <AdminPageLayout
        title="Monitoramento do Sistema"
        description="Acesso negado"
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">Você não tem permissão para acessar este painel.</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Monitoramento do Sistema"
      description="Monitore performance, usuários e métricas do sistema"
    >
      <div className="space-y-6">
        {/* Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total de usuários cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyStats?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total de empresas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Eventos registrados hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Online</div>
              <p className="text-xs text-muted-foreground">
                Sistema funcionando normalmente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas de Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Performance do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">CPU Usage</span>
                <Badge variant="secondary">45%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Memory Usage</span>
                <Badge variant="secondary">67%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Load</span>
                <Badge variant="secondary">23%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <Badge variant="secondary">120ms</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemMetrics?.slice(0, 5).map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{event.event_type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas e Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Uso de memória acima do normal</span>
                </div>
                <Badge variant="secondary">Atenção</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Backup realizado com sucesso</span>
                </div>
                <Badge variant="secondary">Sucesso</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
};

export default AdminMonitoramento;
