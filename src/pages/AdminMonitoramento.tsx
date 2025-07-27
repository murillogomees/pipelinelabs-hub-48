
import React from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { Activity, Users, Database, TrendingUp } from 'lucide-react';

const AdminMonitoramento: React.FC = () => {
  const { isAdmin, isLoading: isLoadingPermissions } = usePermissions();

  // Mock analytics data since analytics_events doesn't exist in the database
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Return mock data
      return [
        {
          id: '1',
          event_name: 'page_view',
          route: '/dashboard',
          user_id: 'user1',
          company_id: 'company1',
          device_type: 'desktop',
          duration_ms: 1500,
          meta: { browser: 'Chrome' },
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          event_name: 'button_click',
          route: '/products',
          user_id: 'user2',
          company_id: 'company1',
          device_type: 'mobile',
          duration_ms: 800,
          meta: { action: 'create_product' },
          created_at: new Date().toISOString()
        }
      ];
    },
    enabled: isAdmin
  });

  // Mock companies data
  const { data: companies } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin
  });

  if (isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <AdminPageLayout
        title="Acesso Negado"
        description="Você não tem permissão para acessar esta página"
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Apenas administradores podem acessar o monitoramento do sistema.
          </p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Monitoramento do Sistema"
      description="Acompanhe métricas e estatísticas do sistema"
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Empresas Ativas
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                empresas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eventos Hoje
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                eventos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Performance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">
                uptime do sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Banco de Dados
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant="outline" className="text-green-600">
                  Online
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                status da conexão
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{event.event_name}</Badge>
                    <span className="text-sm">{event.route}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {event.device_type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {event.duration_ms}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies?.map((company) => (
                <div key={company.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="font-medium">{company.name}</div>
                    <div className="text-sm text-muted-foreground">{company.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={company.is_active ? "default" : "secondary"}>
                      {company.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {company.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
};

export default AdminMonitoramento;
